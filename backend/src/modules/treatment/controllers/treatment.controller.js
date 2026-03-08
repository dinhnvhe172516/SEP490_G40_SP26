const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const successRes = require("../../../common/success");
const { cleanObjectData } = require("../../../common/utils/cleanObjectData");

const ServiceProcess = require("../services/treatment.service");
const dentalService = require("../services/dental.record.service");
const appointmentService = require("../../appointment/services/appointment.service");
const { checkRequiredFields } = require("../../../utils/checkRequiredFields");


/*
    get treatment by id
*/
const getByIdController = async (req, res) => {
  const context = "TreatmentController.getByIdController";
  try {
    const { id: treatmentId } = req.params; 
    logger.debug("Get treatment by id request received", {
      context: context,
      treatmentId: treatmentId,
    });

    // check id empty
    if (!treatmentId) {
      logger.warn("Empty ID", {
        context: context,
        treatmentId: treatmentId,
      });
      throw new errorRes.BadRequestError("Treatment ID is required");
    }

    // Gọi service xử lý logic
    const service = await ServiceProcess.getByIdService(treatmentId);
    return new successRes.GetDetailSuccess(
      service,
      "Treatment retrieved successfully",
    ).send(res);
  } catch (error) {
    logger.error("Error get treatment by id", {
      context: "TreatmentController.getByIdController",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * create new treatment by dental record id and body must have appointment_id
 * - Lưu ý: Đây là controller dành cho việc tạo mới một treatment dựa trên một dental record đã tồn tại.
 * - Client sẽ gửi lên ID của dental record mà treatment này thuộc về, cùng với các thông tin cần thiết để tạo treatment. 
 * - Controller sẽ lấy ID của dental record từ URL params, và các thông tin khác từ body request.
 * * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createController = async (req, res) => {
  const context = "TreatmentController.createController";
  try {
    const { id: dentalRecordId } = req.params;
    
    const cleanedData = cleanObjectData(req.body || {});

    logger.debug("Create new treatment request received", {
      context: context,
      dentalRecordId: dentalRecordId,
      bodyData: cleanedData
    });

    if (!dentalRecordId) {
      throw new errorRes.BadRequestError("Dental record ID is required in URL");
    }

    /*
      Kiểm tra xem dental record có tồn tại không và có đang ở trạng thái IN_PROGRESS không
      - Nếu dental record không tồn tại, trả về lỗi NotFound
      - Nếu dental record tồn tại nhưng không ở trạng thái IN_PROGRESS, trả về lỗi BadRequest (vì chỉ có thể thêm treatment vào dental record đang tiến hành)
    */
    const dental = await dentalService.getDentalRecordById(dentalRecordId);
    if (!dental) {
      logger.warn("Dental record not found for given ID", { context, dentalRecordId });
      throw new errorRes.NotFoundError("Dental record not found");
    }
    if (dental.status !== 'IN_PROGRESS') {
      logger.warn("Attempt to add treatment to a closed dental record", { 
        context, 
        dentalRecordId,
        status: dental.status,
        dental: dental
      });
      throw new errorRes.BadRequestError(
        `Cannot add treatment. Dental record is currently ${dental.status}.`
      );
    }
    cleanedData.record_id = dental._id;
    cleanedData.patient_id = dental.patient_id;

    /*
      Kiểm tra xem appointment có tồn tại không và có thuộc về cùng một bệnh nhân với dental record không
      - Nếu appointment không tồn tại, trả về lỗi NotFound
      - Nếu appointment tồn tại nhưng patient_id của appointment không khớp với patient_id của dental record, 
      trả về lỗi BadRequest (vì treatment phải liên quan đến một cuộc hẹn của cùng một bệnh nhân)
    */
    const appointment = await appointmentService.findById(cleanedData.appointment_id);
    if (!appointment) {
      logger.warn("Appointment not found for given ID", { 
        context, 
        appointmentId: cleanedData.appointment_id 
      });
      throw new errorRes.NotFoundError("Appointment not found");
    }
    if (String(appointment.patient_id) !== String(cleanedData.patient_id)) {
      logger.warn("Appointment patient ID does not match dental record patient ID", { 
        context, 
        appointmentId: cleanedData.appointment_id, 
        appointmentPatientId: appointment.patient_id,
        dentalRecordPatientId: cleanedData.patient_id
      });
      throw new errorRes.BadRequestError("Appointment does not belong to the same patient as the dental record");
    }
    cleanedData.doctor_id = appointment.doctor_id;

    const requiredFields = [
      "record_id",
      "appointment_id", 
      "patient_id",
      "doctor_id",
      "phase"// Schema yêu cầu bắt buộc (PLAN hoặc SESSION)
    ];
    checkRequiredFields(requiredFields, cleanedData, this, "createController");
    const newTreatment = await ServiceProcess.createService(cleanedData);
    if (!newTreatment) {
      logger.warn("Failed to create new treatment", { context, dentalRecordId });
      throw new errorRes.BadRequestError("Create new treatment fails.");
    }
    return new successRes.CreateSuccess(
        newTreatment,
        "Treatment created successfully"
    ).send(res);
  } catch (error) {
    logger.error("Error create new treatment controller", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error; 
  }
};

// update staff by accountId
const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUpdate = req.body || {};

    // 2. Làm sạch dữ liệu
    // Loại bỏ field 'status' để bảo mật, chỉ lấy phần còn lại
    const { status, ...restData } = dataUpdate;
    const cleanedData = cleanObjectData(restData);

    // Kiểm tra xem có dữ liệu nào để update không (bao gồm cả file)
    if (Object.keys(cleanedData).length === 0 && !req.files) {
      throw new errorRes.BadRequestError("No data provided for update");
    }

    // 3. VALIDATION: Chỉ kiểm tra những trường có trong dữ liệu gửi lên

    // Kiểm tra Email
    if (cleanedData.email) {
      checkEmail(cleanedData.email);
      // Kiểm tra trùng lặp email, ngoại trừ chính tài khoản này
      const isEmailExist = await ServiceProcess.checkUniqueEmailNotId(
        cleanedData.email,
        accountId,
      );
      if (isEmailExist) {
        throw new errorRes.ConflictError("Email already exists!");
      }
    }

    // Kiểm tra Username
    if (cleanedData.username) {
      // Kiểm tra trùng lặp username, ngoại trừ chính tài khoản này
      const isUsernameExist = await ServiceProcess.checkUniqueUsernameNotId(
        cleanedData.username,
        accountId,
      );
      if (isUsernameExist) {
        throw new errorRes.ConflictError("Username already exists!");
      }
    }

    // Validate các trường thông thường
    if (cleanedData.phone_number) checkPhone(cleanedData.phone_number);
    // Lưu ý: Nếu update password, hãy đảm bảo password được hash trước khi lưu vào DB (có thể xử lý ở Service hoặc tại đây)
    if (cleanedData.password) checkPassword(cleanedData.password);

    // 4. Validate License (Logic nghiệp vụ đặc thù)
    if (cleanedData.license_number) {
      checkLicenseNumber(cleanedData.license_number);
      // SỬA LỖI: Dùng biến accountId thay vì id
      const isLicenseExist = await ServiceProcess.checkUniqueLicenseNumberNotId(
        cleanedData.license_number,
        accountId,
      );
      if (isLicenseExist) {
        throw new errorRes.ConflictError("License number already exists!");
      }
    }

    if (cleanedData.issued_by) checkIssuedBy(cleanedData.issued_by);
    if (cleanedData.issued_date) checkIssuedDate(cleanedData.issued_date);

    // 5. Xử lý upload file (Cloudinary)
    if (req.files) {
      if (req.files["avatar"]) {
        // Lấy file đầu tiên trong mảng avatar
        cleanedData.avatar_url = await uploadToCloudinary(
          req.files["avatar"][0],
          "user_avatars",
        );
      }
      if (req.files["license"]) {
        // Upload nhiều file license nếu cần
        cleanedData.document_url = await uploadMultipleToCloudinary(
          req.files["license"],
          "user_licenses",
        );
      }
    }

    // 6. Gọi Service thực hiện cập nhật
    // SỬA LỖI: Dùng biến accountId thay vì id
    const updated = await ServiceProcess.updateService(accountId, cleanedData);

    // Gửi response thành công
    return new successRes.UpdateSuccess(updated).send(res);
  } catch (error) {
    // Logging lỗi chi tiết để debug
    logger.error("Error update appointmet", {
      context: "AppointmentController.updateController",
      message: error.message,
      stack: error.stack, // Nên log thêm stack trace để dễ sửa lỗi
    });
    throw error;
  }
};

/**
 * upate status of treatment
 * @param {*} req (status) mới và id của appointment cần cập nhật
 * @param {*} res 
 * @returns {object} treatment đã được cập nhật
 */
const updateStatusController = async (req, res) => {
  const context = "TreatmentController.updateStatusController";
  try {
    // 1. Lấy ID của Appointment
    const { id } = req.params;
    const { status } = req.body || {};

    logger.debug("Update treatment status request received", {
      context: context,
      treatmentId: id,
      status: status,
    });

    // 2. Validate Status
    const validStatuses = ['PLANNED', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      logger.warn("Invalid or missing status value", {
        context: context,
        status: status,
        allowed: validStatuses,
      });
      throw new errorRes.BadRequestError(
        `Invalid status. Allowed values: ${validStatuses.join(", ")}`
      );
    }

    const result = await ServiceProcess.updateStatusOnly(id, status);

    // Kiểm tra kết quả
    if (!result) {
      throw new errorRes.NotFoundError("Treatment not found or update failed");
    }

    logger.info("Treatment status updated successfully", {
      context: context,
      treatmentId: result._id,
      newStatus: result.status,
    });

    // 4. Trả về kết quả
    return new successRes.UpdateSuccess(
      result,
      "Treatment status updated successfully"
    ).send(res);

  } catch (error) {
    logger.error("Error updating treatment status", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  getByIdController,
  createController,
  updateController,
  updateStatusController,
};
