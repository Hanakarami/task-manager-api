export const handleError = (res: any, error: any, message = "Something went wrong", statusCode = 500) => {
  console.error(error); 
  res.status(statusCode).json({
    success: false,
    message,
    error: error.message || error,
  });
};