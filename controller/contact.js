

async function contactform(req, res) {
    try{

        const {firstname , lastname , email , phonenumber, message} = req.body;
        if(!firstname || !lastname || !email || !message || !phonenumber) {
            return res.status(401).json({
                success:false,
                message:"all fields are required"
            })
        }

        // creat entry in db and send response

        await 

    } catch(error) {

    }
}

module.exports={contactform}