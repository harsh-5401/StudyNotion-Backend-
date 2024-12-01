const nodemailer=require("nodemailer");
require("dotenv").config();

async function mailsender(email , title , body){
    try{
        
        //creat transporter
        const transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASSWORD
            }    
        });

        // send mail
        let info= await transporter.sendMail({
            from:`harsh mega project`,
            to:`${email}`,
            subject:`${title}`,
            html:`<p>${body}</p>`
        });

        // console.log("mail info=" ,info);
        return info;

    } catch(error){
        console.log(error.message);

    }
}

module.exports=mailsender; 