import twilio from "twilio";
let accountSid ;
let authToken ;
let client ;

const initializeClient = ()=>{
    accountSid = process.env.TWILIO_ACCOUNT_SID;
    authToken = process.env.TWILIO_AUTH_TOKEN;
    client = twilio(accountSid, authToken);

}

const sendVerificationSms = async (mobile)=>{
    const verification = await client.verify.v2
        .services(process.env.SMS_SERVICE_SID)
        .verifications.create({
        channel: "sms",
        to:mobile,
        });

    return verification;
}

const verifyCode = async (mobile, code)=>{
    try{
        const verificationCheck = await client.verify.v2
        .services(process.env.SMS_SERVICE_SID)
        .verificationChecks.create({
        code: code,
        to: mobile,
        });

        return verificationCheck;
    }

    catch(err){
        return null;
    }
}

export {sendVerificationSms, verifyCode, initializeClient};