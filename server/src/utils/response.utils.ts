import { Response } from "express";

export const sendSuccessResponse = (
  res: Response,
  data: Record<string, any>,
  message = "Success",
) => {
  res.status(200).json({
    data: data,
    status: true,
    message: message,
  });
};

export const sendErrorResponse = (
  res: Response,
  error: Error,
  message = "Something Went Wrong",
  status = 406,
) => {
  console.log("Error", (error as any).data);
  res.status(status).json({
    data: error.message,
    status: false,
    message: message,
  });
};

export const sendEmptyResponse = (res: Response, data: any) => {
  res.status(204).json({
    data: data,
    status: false,
    message: "No Data",
  });
};
