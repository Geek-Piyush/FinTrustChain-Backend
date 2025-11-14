import GuarantorRequest from "../models/guarantorRequestModel.js";
import LoanRequest from "../models/loanRequestModel.js";
import User from "../models/userModel.js";

// GET /guarantor-requests/pending
// Get all pending guarantor requests for the logged-in user
export const getPendingGuarantorRequests = async (req, res, next) => {
  try {
    const user = req.user;

    const requests = await GuarantorRequest.find({
      guarantor: user.id,
      status: "PENDING",
    })
      .populate("receiver", "name avatarUrl trustIndex")
      .populate("loanRequest")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: requests.length,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

// GET /guarantor-requests/:id
// Get details of a specific guarantor request
export const getGuarantorRequestById = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const request = await GuarantorRequest.findById(id)
      .populate("receiver", "name avatarUrl trustIndex")
      .populate("guarantor", "name avatarUrl trustIndex")
      .populate("loanRequest");

    if (!request) {
      throw new Error("Guarantor request not found.");
    }

    // Check if user is authorized to view this request
    const isAuthorized =
      request.guarantor._id.equals(user.id) ||
      request.receiver._id.equals(user.id);

    if (!isAuthorized) {
      throw new Error("You are not authorized to view this request.");
    }

    res.status(200).json({
      status: "success",
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

// POST /guarantor-requests

export const createGuarantorRequest = async (req, res, next) => {
  try {
    const receiver = req.user;
    const { guarantorId, loanRequestId } = req.body;

    // --- Validation ---
    if (receiver.id === guarantorId) {
      throw new Error("You cannot request yourself to be a guarantor.");
    }

    // --- NEW VALIDATION RULE ---
    // Check if the potential guarantor is already an endorser of the receiver.
    // The `endorsementsReceived` array on the receiver's user object holds the IDs of everyone who has endorsed them.
    if (!receiver.endorsementsReceived.includes(guarantorId)) {
      throw new Error(
        "You can only request a user to be your guarantor if they have already endorsed you."
      );
    }
    // --- END NEW VALIDATION RULE ---

    const loanRequest = await LoanRequest.findOne({
      _id: loanRequestId,
      receiver: receiver.id,
    });
    if (!loanRequest) {
      throw new Error(
        "The specified loan request does not exist or does not belong to you."
      );
    }
    if (loanRequest.status !== "PENDING") {
      throw new Error(
        "You can only send guarantor requests for a pending loan application."
      );
    }

    // --- Create Request ---
    const guarantorRequest = await GuarantorRequest.create({
      receiver: receiver.id,
      guarantor: guarantorId,
      loanRequest: loanRequestId,
    });

    res.status(201).json({
      status: "success",
      message: "Guarantor request sent successfully.",
      data: { request: guarantorRequest },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new Error(
          "A guarantor request has already been sent to this user for this loan."
        )
      );
    }
    next(error);
  }
};

/**
 * PATCH /guarantor-requests/:id
 * Allows a user to accept or decline a guarantor request sent to them.
 */
export const respondToGuarantorRequest = async (req, res, next) => {
  try {
    const guarantor = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      throw new Error("Invalid status. Must be 'ACCEPTED' or 'DECLINED'.");
    }
    const request = await GuarantorRequest.findById(id);
    if (
      !request ||
      request.guarantor.toString() !== guarantor.id ||
      request.status !== "PENDING"
    ) {
      throw new Error(
        "This request is not valid or you are not authorized to respond to it."
      );
    }

    request.status = status;
    await request.save();

    if (status === "ACCEPTED") {
      const loanRequest = await LoanRequest.findById(request.loanRequest);
      if (loanRequest) {
        loanRequest.guarantor = guarantor.id;
        loanRequest.guarantorStatus = "ACCEPTED";
        loanRequest.status = "GUARANTOR_ACCEPTED";
        await loanRequest.save();
      }
    } else if (status === "DECLINED") {
      // If declined, update the parent loan request to reflect this.
      const loanRequest = await LoanRequest.findById(request.loanRequest);
      if (loanRequest) {
        loanRequest.guarantorStatus = "DECLINED";
        // We set the guarantor field back to null so the receiver can find a new one.
        loanRequest.guarantor = undefined;
        await loanRequest.save();
      }
    }

    res.status(200).json({
      status: "success",
      message: `Request has been ${status.toLowerCase()}.`,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};
