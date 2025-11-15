import Contract from "../models/contractModel.js";
import GuarantorRequest from "../models/guarantorRequestModel.js";
import LoanRequest from "../models/loanRequestModel.js";
import LoanBrochure from "../models/loanBrochureModel.js";
import User from "../models/userModel.js";
import * as trustIndexService from "../services/trustIndexService.js";

// GET /dashboard/my-stats

export const getMyStats = async (req, res, next) => {
  try {
    const user = req.user;

    // Count active contracts where the user is the receiver or lender
    const activeContractsAsReceiver = await Contract.countDocuments({
      receiver: user._id,
      status: "ACTIVE",
    });
    const activeContractsAsLender = await Contract.countDocuments({
      lender: user._id,
      status: "ACTIVE",
    });

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          trustIndex: user.trustIndex,
          eligibleLoan: user.milestones.eligibleLoan,
          endorsementsGiven: user.endorsementsGiven.length,
          endorsementsReceived: user.endorsementsReceived.length,
          successfulRepayments: user.successfulRepayments,
          defaults: user.defaults,
          activeLoansAsReceiver: activeContractsAsReceiver,
          activeLoansAsLender: activeContractsAsLender,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

//  GET /dashboard/my-active-contracts

export const getMyActiveContracts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const contracts = await Contract.find({
      $or: [{ receiver: userId }, { lender: userId }, { guarantor: userId }],
      status: "ACTIVE",
    }).populate("lender receiver guarantor", "name avatarUrl");

    res.status(200).json({
      status: "success",
      results: contracts.length,
      data: {
        contracts,
      },
    });
  } catch (error) {
    next(error);
  }
};

//GET /dashboard/my-pending-actions

export const getMyPendingActions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find contracts awaiting this user's signature
    const contractsToSign = await Contract.find({
      $or: [
        { receiver: userId, "signatures.receiver": false },
        { guarantor: userId, "signatures.guarantor": false },
        { lender: userId, "signatures.lender": false },
      ],
      status: "PENDING_SIGNATURES",
    });

    // Find guarantor requests sent to this user
    const guarantorRequests = await GuarantorRequest.find({
      guarantor: userId,
      status: "PENDING",
    }).populate("receiver", "name avatarUrl");

    // Find loan requests for this lender's brochures
    const myBrochures = await LoanBrochure.find({ lender: userId }).select(
      "_id"
    );
    const myBrochureIds = myBrochures.map(b => b.id);
    const loanRequests = await LoanRequest.find({
      brochureIds: { $in: myBrochureIds },
      status: "GUARANTOR_ACCEPTED",
    }).populate("receiver", "name avatarUrl");

    res.status(200).json({
      status: "success",
      data: {
        pendingActions: {
          contractsToSign,
          guarantorRequests,
          loanRequests,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /dashboard/ti-history

export const getMyTiHistory = (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      tiHistory: req.user.tiHistory,
    },
  });
};

export const getMyEndorsers = async (req, res, next) => {
  try {
    // The 'protect' middleware gives us req.user, which already contains the IDs.
    // We just need to populate them to get the full user details.
    const user = await User.findById(req.user.id).populate(
      "endorsementsReceived",
      "name avatarUrl trustIndex"
    );
    if (!user) {
      throw new Error("User not found.");
    }

    res.status(200).json({
      status: "success",
      results: user.endorsementsReceived.length,
      data: {
        endorsers: user.endorsementsReceived,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEligibleGuarantors = async (req, res, next) => {
  try {
    // Find the logged-in user and populate the endorsementsReceived field
    const user = await User.findById(req.user.id).populate(
      "endorsementsReceived",
      "name"
    );

    if (!user) {
      throw new Error("User not found.");
    }

    res.status(200).json({
      status: "success",
      results: user.endorsementsReceived.length,
      data: {
        eligibleGuarantors: user.endorsementsReceived,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEligibleBrochures = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.currentRole !== "RECEIVER") {
      throw new Error("Only receivers can view eligible brochures");
    }

    // Get user's max loan limit based on TI
    const maxLoanLimit = trustIndexService.getMaxLoanLimit(user.trustIndex);

    // Find active brochures within the user's limit
    // Exclude brochures from the user themselves (if they're also a lender)
    const brochures = await LoanBrochure.find({
      active: true,
      amount: { $lte: maxLoanLimit },
      lender: { $ne: user._id },
    })
      .populate("lender", "name email trustIndex")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: brochures.length,
      data: {
        brochures,
        maxEligibleAmount: maxLoanLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};
