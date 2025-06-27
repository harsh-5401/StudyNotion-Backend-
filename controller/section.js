const sectionmodel=require("../models/section");
const coursemodel=require("../models/course");
const subsectionmodel= require("../models/subsection");


 async function createsection(req,res){
    try{
        // fetch section name
        const {sectionname , courseid}=req.body;
        // validate
        if(!sectionname || !courseid){
            return res.status(400).json({
                success:false,
                message:"all fields are requred for creatinf section"
            })
        }
        //creat section
        const newsection=await sectionmodel.create({sectionname});
        
        // update courese with section id
        const updatedcoursedetails=await coursemodel.findByIdAndUpdate( courseid,
                                                            {
                                                                $push:{
                                                                    coursecontent:newsection._id
                                                                }
                                                            },
                                                            {new:true}
                                                        ).populate("coursecontent").exec();
                                                     
        //HW: use populate to replace  both section and sunsection  bith in updated course
        // return response   

        return res.status(200).json({
            success:true,
            message:"section created succesfully",
            updatedcoursedetails

        });


    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unabel to creat section"
        });
    }
}

async function updatesection(req,res){
    try{
        // fetch new section name
        const {sectionname , sectionid , courseid}=req.body;
        // console.log("courseid is " , courseid)

        // validate
        if(!sectionname || !sectionid){
            return res.status(400).json({
                success:false,
                message:"missing propeties and fields"
            });

        }

        // update data

        const section=await sectionmodel.findByIdAndUpdate(sectionid , {sectionname} , {new:true});

        const updatedCourse = await coursemodel.findById(courseid)
          .populate({
              path:"coursecontent",
              populate: {
                  path:"subsection"
              }});
        // return response

        return res.status(200).json({
            success:true,
            message:"section updated succesfully",
            updatedsection:section,
            updatedCourse

        });


    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unabel to update section"
        });
    }
}

async function deletesection(req,res){
    try{
        // fetch section id 
        // assuming that we are sedning it in params
        // const sectionid=req.params;

        const{sectionid , courseid} = req.body
        // console.log("section id and course id is " , sectionid , " " , courseid)
        

        // validate
        if(!sectionid){
            return res.status(400).json({
                success:false,
                message:"missing propeties and fields"
            });

        }

        // delete section from db
       const sectiondetails= await sectionmodel.findByIdAndDelete(sectionid);

        sectiondetails.subsection.forEach( async (ssid)=>{
            await subsectionmodel.findByIdAndDelete(ssid);
        });

        // console.log('Subsections within the section deleted')

        //  TODO :remove section id from coursecontent array  schema
        // DO we need to delete entry from course schema at time of testing

        //NOTE: Due to cascading deletion, Mongoose automatically triggers the built-in middleware to perform a cascading delete for all the referenced 
        //SubSection documents. DOUBTFUL!

        //From course, courseContent the section gets automatically deleted due to cascading delete feature
        await sectionmodel.findByIdAndDelete(sectionid);
        // console.log('Section deleted')

        const updatedCourse = await coursemodel.findById(courseid)
          .populate({
              path:"coursecontent",
              populate: {
                  path:"subsection"
              }});

        // return response
        return res.status(200).json({
            success:true,
            message:"section deleted succesfully",
            updatedCourse
        });


    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unabel to delete section"
        });
    }
}

module.exports={createsection, updatesection , deletesection};