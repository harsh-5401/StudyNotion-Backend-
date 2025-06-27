const sectionmodel=require("../models/section");
const subsectionmodel=require("../models/subsection")
const coursemodel= require("../models/course")
const uploadimagetocloudinary=require("../utillities/imageuploder");
require("dotenv").config();

 async function createsubsection(req,res){
    try{
        // fetch section name
        const {sectionid, title , timeduration , description}=req.body;
        // console.log("printing");
        // console.log(sectionid , title , timeduration , description);
        const {courseid}= req.body;

        // extract file/video
        const video=req.files.video;
        // console.log("video is" , video)

        // validation
        if(!sectionid || !title  || !description || !video){
            return res.status(400).json({
                success:false,
                message:"all fields are requred for creating sub-section"
            })
        }
        // upload video to cloudinary 
        const uploadetails=await uploadimagetocloudinary(video , process.env.FOLDER_NAME);

        // creat a  sub section
        const subsectiondetails=await subsectionmodel.create({
            title:title,
            timeduration:timeduration,
            description:description,
            videourl:uploadetails.secure_url
        });

        // push subsection id into section
        //HW :POPULATE SUBSECTION DATA
        const updatedsection=await sectionmodel.findByIdAndUpdate( {_id:sectionid},
            {
                $push:{
                    subsection:subsectiondetails._id
                }
            },
            {new:true}
        ).populate("subsection").exec();


        const updatedCourse=await coursemodel.findById(courseid)
                                                    .populate(
                                                        {
                                                            path:"instructor",
                                                            populate:{
                                                                path:"additionalDetails"
                                                            }
                                                        }
                                                    )
                                                    .populate("category")                                                    
                                                    .populate({
                                                        path:"coursecontent",
                                                        populate:{
                                                            path:"subsection"  
                                                        }
                                                    })
                                                    .exec();

        // console.log("updated course in delte subsection is" , updatedCourse)
        
       
        // return response
        
        return res.status(200).json({
            success:true,
            message:"subsection created succesfully",
            updatedsection,
            updatedCourse

        });      


    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unabel to creat subsection"
        });
    }
}


//HW update subsection and delete subsection remaining down

async function updatesubsection(req,res){
    try{
        // fetch new section name
        const {sectionid , subsectionid , title , description}=req.body;
        const {courseid}= req.body;

        // console.log("inside update subsection")
        // console.log("req is" , req)
        // console.log("courseid " , courseid)
        // console.log("sectionid " , sectionid)
        // console.log("subsectionid " , subsectionid)
        // console.log("title " , title)
        // console.log("description " , description)
        
        // validate
        if(!courseid || !subsectionid){
            return res.status(400).json({
                success:false,
                message:"missing propeties and fields"
            });

        }

        const subSection = await subsectionmodel.findById(subsectionid)
  
        if (!subSection) {
            return res.status(404).json({
            success: false,
            message: "SubSection not found",
            })
        }



        // update data

        if (title !== undefined) {
            subSection.title = title
          }
      
          if (description !== undefined) {
            subSection.description = description
          }
          if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadimagetocloudinary(
              video,
              process.env.FOLDER_NAME
            )
            subSection.videourl = uploadDetails.secure_url
            subSection.timeduration = `${uploadDetails.duration}`
          }
      
          await subSection.save()

        // const subsection=await subsectionmodel.findByIdAndUpdate(subsectionid , {subsectionname} , {new:true});
        const updatedSection = await sectionmodel.findById(sectionid).populate("subsection").exec();

        const updatedsubsection=await subsectionmodel.findById(subsectionid);


        const updatedCourse=await coursemodel.findById(courseid)
                                                    .populate(
                                                        {
                                                            path:"instructor",
                                                            populate:{
                                                                path:"additionalDetails"
                                                            }
                                                        }
                                                    )
                                                    .populate("category")
                                                    .populate({
                                                        path:"coursecontent",
                                                        populate:{
                                                            path:"subsection"
                                                        }
                                                    })
                                                    .exec();

        // console.log("updated course in update subsection is" , updatedCourse)
        // return response

        return res.status(200).json({
            success:true,
            message:"section updated succesfully",
            updatedsubsection:updatedsubsection,
            updatedCourse,
            updatedSection:updatedSection

        });


    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unabel to update subsection"
        });
    }
}

async function deletesubsection(req,res){
    try{
        // fetch section id 
        // assuming that we are sedning it in params
        const {sectionid , subsectionid} = req.body;
        const {courseid}= req.body;
        // console.log("inside delete subsection")
        // console.log("courseid " , courseid)
        // console.log("sectionid " , sectionid)
        // console.log("subsectionid " , subsectionid)

        // removing subsection id from section
        await sectionmodel.findByIdAndUpdate(
            { _id: sectionid },
            {
              $pull: {
                subsection: subsectionid,
              },
            }
          )

        // validate
        if(!sectionid || !subsectionid){
            return res.status(400).json({
                success:false,
                message:"missing propeties and fields"
            });

        }

        // delete section

        const subsection=await subsectionmodel.findByIdAndDelete(subsectionid);

        if (!subsection) {
            return res
              .status(404)
              .json({ success: false, message: "SubSection not found" })
        }

        const updatedSection = await sectionmodel.findById(sectionid).populate("subsection")

        const updatedCourse=await coursemodel.findById(courseid)
                                                    .populate(
                                                        {
                                                            path:"instructor",
                                                            populate:{
                                                                path:"additionalDetails"
                                                            }
                                                        }
                                                    )
                                                    .populate("category")
                                                    .populate({
                                                        path:"coursecontent",
                                                        populate:{
                                                            path:"subsection"
                                                        }
                                                    })
                                                    .exec();

        // console.log("updated course in delete subsection is" , updatedCourse)

        // return response

        return res.status(200).json({
            success:true,
            message:"sub-section deleted succesfully",
            data:updatedSection,
            updatedCourse
        });


    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unabel to delete sub-section"
        });
    }
}

module.exports={createsubsection, updatesubsection , deletesubsection};