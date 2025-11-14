import mongoose from "mongoose";
import fs from "fs/promises";
import fsSync from "fs";
import Contract from "../models/contractModel.js";
import LoanRequest from "../models/loanRequestModel.js";
import Transaction from "../models/transactionModel.js";
import * as pdfService from "../services/pdfService.js";
import multer from "multer";
import path from "path";
import * as paymentService from "../services/paymentService.js";

// --- MULTER SETUP for Payment Proof ---
const proofStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/proofs");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `proof-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});
export const uploadProof = multer({ storage: proofStorage }).single("proof");

export const createContract = async loanRequestId => {
  // This function remains the same as your reference.
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const loanRequest = await LoanRequest.findById(loanRequestId)
      .populate("receiver")
      .populate("guarantor")
      .populate({ path: "selectedBrochure", populate: { path: "lender" } })
      .session(session);

    if (!loanRequest || !loanRequest.selectedBrochure) {
      throw new Error("Valid loan request with a selected brochure not found.");
    }

    const { receiver, guarantor, selectedBrochure } = loanRequest;
    const { lender } = selectedBrochure;
    const dateStr = new Date().toISOString().split("T")[0];
    const contractId = `C-${dateStr}-${receiver.id.slice(-4)}-${lender.id.slice(
      -4
    )}`;
    const pdfFilename = `Contract-${contractId}-unsigned.pdf`;

    const contractData = {
      contractId,
      dateISO: dateStr,
      loanAmountDisplay: `₹${selectedBrochure.amount.toLocaleString("en-IN")}`,
      interestRateDisplay: `${selectedBrochure.interestRate}%.`,
      repaymentPeriodDisplay: `${selectedBrochure.tenorDays} days`,
      startDateDisplay: new Date().toLocaleDateString("en-GB"),
      endDateDisplay: new Date(
        Date.now() + selectedBrochure.tenorDays * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-GB"),
      receiver: { name: receiver.name, tiAtSigning: receiver.trustIndex },
      guarantor: { name: guarantor.name, tiAtSigning: guarantor.trustIndex },
      lender: { name: lender.name, tiAtSigning: lender.trustIndex },
    };

    await pdfService.createContractPDF(contractData, pdfFilename);

    const newContract = await Contract.create(
      [
        {
          loanRequest: loanRequestId,
          lender: lender.id,
          receiver: receiver.id,
          guarantor: guarantor.id,
          principal: selectedBrochure.amount,
          interestRate: selectedBrochure.interestRate,
          tenorDays: selectedBrochure.tenorDays,
          pdfFilename: pdfFilename,
          status: "PENDING_SIGNATURES",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    console.log(`Contract ${newContract[0].id} created. Ready for signatures.`);
    return newContract[0];
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating contract:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//POST /contracts/:id/sign
export const signContract = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const contract = await Contract.findById(id);
    if (!contract || contract.status !== "PENDING_SIGNATURES") {
      throw new Error("This contract is not available for signing.");
    }

    let userRole = null;
    if (contract.receiver.equals(user.id)) userRole = "receiver";
    else if (contract.guarantor.equals(user.id)) userRole = "guarantor";
    else if (contract.lender.equals(user.id)) userRole = "lender";

    if (!userRole) throw new Error("You are not a party to this contract.");
    if (contract.signatures[userRole])
      throw new Error("You have already signed this contract.");

    await pdfService.applySignatureToPDF(contract.pdfFilename, user, userRole);
    contract.signatures[userRole] = true;

    const { receiver, guarantor, lender } = contract.signatures;
    if (receiver && guarantor && lender) {
      contract.status = "AWAITING_DISBURSAL";

      const oldFilename = contract.pdfFilename;
      const newFilename = oldFilename.replace("-unsigned.pdf", "-signed.pdf");
      const oldPath = path.resolve(`./public/contracts/${oldFilename}`);
      const newPath = path.resolve(`./public/contracts/${newFilename}`);
      await fs.rename(oldPath, newPath);
      contract.pdfFilename = newFilename;
    }

    await contract.save();

    res.status(200).json({
      status: "success",
      message: "Contract signed successfully.",
      data: { contract },
    });
  } catch (error) {
    next(error);
  }
};

//POST /contracts/:id/confirm-disbursal
export const confirmDisbursal = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { transactionId } = req.body; // Get transactionId from the form data

    if (!req.file) {
      throw new Error("A screenshot of the payment proof is required.");
    }
    if (!transactionId) {
      throw new Error("The payment transaction ID is required.");
    }

    const contract = await Contract.findById(id);

    if (!contract || !contract.lender.equals(user.id)) {
      throw new Error("Contract not found or you are not the lender.");
    }
    if (contract.status !== "AWAITING_DISBURSAL") {
      throw new Error("This contract is not awaiting disbursal.");
    }

    // Create a transaction log with the new proof fields
    await Transaction.create({
      contract: contract.id,
      fromUser: contract.lender,
      toUser: contract.receiver,
      amount: contract.principal,
      status: "DISBURSED",
      proofOfPaymentFilename: req.file.filename,
      paymentTransactionId: transactionId,
    });

    contract.status = "AWAITING_RECEIPT_CONFIRMATION";
    await contract.save();

    res.status(200).json({
      status: "success",
      message: "Disbursal confirmed. Awaiting receiver to confirm receipt.",
      data: { contract },
    });
  } catch (error) {
    next(error);
  }
};

//NEW: POST /contracts/:id/confirm-receipt

export const confirmReceipt = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const contract = await Contract.findById(id);

    // Validation
    if (!contract || !contract.receiver.equals(user.id)) {
      throw new Error(
        "Contract not found or you are not the receiver for this contract."
      );
    }
    if (contract.status !== "AWAITING_RECEIPT_CONFIRMATION") {
      throw new Error("This contract is not awaiting receipt confirmation.");
    }

    // Find and update the transaction log
    const transaction = await Transaction.findOne({
      contract: contract.id,
      status: "DISBURSED",
    });
    if (!transaction) {
      throw new Error(
        "No pending disbursal transaction found for this contract."
      );
    }
    transaction.status = "CONFIRMED";
    await transaction.save();

    // --- FINAL TRIGGER: Activate the loan ---
    contract.status = "ACTIVE";
    contract.startDate = new Date();
    contract.endDate = new Date(
      Date.now() + contract.tenorDays * 24 * 60 * 60 * 1000
    );

    await contract.save();

    res.status(200).json({
      status: "success",
      message:
        "Receipt confirmed. The loan is now active and repayment has begun.",
      data: { contract },
    });
  } catch (error) {
    next(error);
  }
};

// POST /contracts/:id/guarantor-pay

export const initiateGuarantorPayment = async (req, res, next) => {
  try {
    const guarantor = req.user;
    const { id } = req.params;

    const contract = await Contract.findById(id);

    // Validation
    if (!contract || !contract.guarantor.equals(guarantor.id)) {
      throw new Error(
        "Contract not found or you are not the guarantor for this contract."
      );
    }
    if (contract.status !== "DEFAULT") {
      throw new Error("This contract is not in a defaulted state.");
    }

    // The guarantor is liable for 50% of the principal
    const guarantorLiability = contract.principal * 0.5;

    // We reuse our existing payment service, passing the guarantor as the user and the specific liability amount.
    const redirectUrl = await paymentService.initiatePayment(
      id,
      guarantor,
      guarantorLiability
    );

    res.status(200).json({
      status: "success",
      message: "Guarantor payment initiated successfully.",
      data: {
        redirectUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// NEW: GET /contracts/:id/disbursal-proof

export const getDisbursalProof = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params; // This is the Contract ID

    const contract = await Contract.findById(id);

    // Validation
    if (!contract || !contract.receiver.equals(user.id)) {
      throw new Error(
        "Contract not found or you are not the receiver for this contract."
      );
    }
    if (contract.status !== "AWAITING_RECEIPT_CONFIRMATION") {
      throw new Error(
        "Proof of payment is only available when the contract is awaiting your confirmation."
      );
    }

    // Find the transaction log associated with this contract
    const transaction = await Transaction.findOne({
      contract: contract.id,
      status: "DISBURSED",
    });

    if (!transaction) {
      throw new Error(
        "No disbursal proof has been uploaded for this contract yet."
      );
    }

    // Construct the full URL for the image
    const imageUrl = `${req.protocol}://${req.get("host")}/img/proofs/${
      transaction.proofOfPaymentFilename
    }`;

    res.status(200).json({
      status: "success",
      data: {
        transactionId: transaction.paymentTransactionId,
        proofImageUrl: imageUrl,
        uploadedAt: transaction.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getContractDetails = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params; // The Contract ID

    const contract = await Contract.findById(id)
      .populate("lender", "name avatarUrl")
      .populate("receiver", "name avatarUrl")
      .populate("guarantor", "name avatarUrl");

    if (!contract) {
      throw new Error("Contract not found.");
    }

    // --- Security Check ---
    // Ensure the logged-in user is a party to this contract
    const isParty =
      contract.lender._id.equals(user.id) ||
      contract.receiver._id.equals(user.id) ||
      contract.guarantor._id.equals(user.id);

    if (!isParty) {
      throw new Error("You are not authorized to view this contract.");
    }

    // Calculate total payable amount (principal + interest)
    const totalPayable =
      contract.principal + (contract.principal * contract.interestRate) / 100;

    res.status(200).json({
      status: "success",
      data: {
        contract: {
          ...contract.toObject(),
          totalPayable,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /contracts/:id/receiver-upi
// Securely fetches the receiver's UPI ID for the lender of a specific contract.
export const getReceiverUpi = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params; // The Contract ID

    const contract = await Contract.findById(id).populate({
      path: "receiver",
      select: "name upiId",
    });

    if (!contract) {
      throw new Error("Contract not found.");
    }

    // --- SECURITY CHECK ---
    // Ensure the logged-in user is the lender for this specific contract.
    if (!contract.lender.equals(user.id)) {
      throw new Error(
        "You are not authorized to view the receiver's UPI ID for this contract."
      );
    }

    // Check if the receiver has added a UPI ID
    if (!contract.receiver.upiId) {
      throw new Error("The receiver has not provided a UPI ID yet.");
    }

    res.status(200).json({
      status: "success",
      data: {
        receiverName: contract.receiver.name,
        upiId: contract.receiver.upiId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Fetch and download contract PDF
export const getContractPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the contract
    const contract = await Contract.findById(id).populate(
      "receiver lender guarantor"
    );

    if (!contract) {
      return next(new Error("Contract not found."));
    }

    // Check if the user is authorized to access this contract
    const isAuthorized =
      userId === contract.receiver.id.toString() ||
      userId === contract.lender.id.toString() ||
      userId === contract.guarantor.id.toString();

    if (!isAuthorized) {
      return next(
        new Error(
          "You are not authorized to access this contract. Only involved parties can view the contract PDF."
        )
      );
    }

    // Check if PDF filename exists
    if (!contract.pdfFilename) {
      return next(new Error("Contract PDF not found."));
    }

    // Construct the full file path
    const filePath = path.join(
      process.cwd(),
      "public/contracts",
      contract.pdfFilename
    );

    // Check if file exists
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      return next(new Error("Contract PDF file does not exist on the server."));
    }

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${contract.pdfFilename}"`
    );

    // Stream the file to the client
    const fileStream = fsSync.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on("error", error => {
      console.error("Error reading PDF file:", error);
      if (!res.headersSent) {
        res.status(500).json({
          status: "error",
          message: "Error reading PDF file.",
        });
      }
    });
  } catch (error) {
    next(error);
  }
};
