const apiResponse = (statusCode=200, data={}, message="Success")=>{
    return {
        statusCode,
        data,
        message,
        success: statusCode<400,
    }
}

export default apiResponse;