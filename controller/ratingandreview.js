const ratingandreviewmodel=require("../models/ratingandreview");
const coursemodel=require("../models/course");

const mongoose = require("mongoose")


async function createratingandreview(req,res){
    try{
        // get user id as user is already logged in
        const userid=req.user.id;
        console.log("userid INSIDE=" , userid);
        
        // get other data
        const{courseid , rating , review}=req.body;
        console.log("COURSE ID INSIDE=", courseid);
        console.log("rating and review is" , rating , " " , review);


        // check if user is enrolled or not
        const coursedetails=await coursemodel.findOne(
                                            {_id:courseid,
                                                studentsenrolled: {$elemMatch : {$eq : userid}}

                                            }
                                        );
        
        if(!coursedetails){
            return res.status(404).json({
                success:false,
                message:"student is not enrolled in course"
            })
        }

        // check if that user has already reviewed the course or not
        const alreadyreviewd=await ratingandreviewmodel.findOne({
            user:userid,
            course:courseid,
        });

        if(alreadyreviewd){
            return res.status(403).json({
                success:false,
                message:"course is already reviewd by user"
            })
        }

        // creat rating and review
        const createdReviewandRating=await ratingandreviewmodel.create({
            user:userid,
            rating:rating,
            review:review,
            course:courseid
        });

        // update courseschema with this rating
        const updatedcourseddetails=await coursemodel.findByIdAndUpdate(
            {_id:courseid},
            {$push:{ratingAndreviews : createdReviewandRating._id}},
            {new:true}
        )

        console.log("updatedcoursedetails = " , updatedcourseddetails);

        // return response

        return res.status(200).json({
            success:true,
            message:"review and rating creaated succesfully ",
            createdReviewandRating
        })


    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"failed to creat rating and review"
        })
    }
}




async function getAverageRating(req,res){
    try{
        // get course id
        const {courseid} = req.body.courseid;

        // calculate average rating
        // aggreagte function return array
        const result=await ratingandreviewmodel.aggregate([
            {   
                // first find course with id=courseid
                // initailly our course id is string here we are converting it into object id
                $match:{
                    course: new mongoose.Types.ObjectId(courseid),
                }
            },
            // wrap all entires in single group
            {
                $group:{
                    _id:null,
                    // find avearge using avg->average function
                    averagerating:{ $avg : "$rating"},
                }
            }
        ]);

        if(result.length>0){
            return res.status(200).json({
                success:true,
                message:"average rating found",
                // rating is stored at 0th index
                averagerating:result[0].averagerating
            })
        }
        // if no rating found
        
        return res.status(200).json({
            success:true,
            message:"no one reviewd the course  no rating till now",
            averagerating:0
        });

    } catch (error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"failed to get average rating"
        })
    }
}


// get all rating and review regardlless of courseid


async function getallratingandReview(req,res){
    try{
        
        // const ratingandreview=await ratingandreviewmodel.find({}).sort("desc").populate("user" , "course").exec();

        const ratingandreview=await ratingandreviewmodel.find({}).sort("desc")
                                                                .populate({
                                                                    // poplulate user and populate only selected fileds
                                                                    path:"user",
                                                                    select: "firstname lastname email image"
                                                                })
                                                                .populate({
                                                                    path:"course",
                                                                    select:"coursename"
                                                                })
                                                                .exec();


        return res.status(200).json({
            success:true,
            message:"All reviews and rating fetched succesfully",
            AllRatingandReviews:ratingandreview
        });
        

    } catch (error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"failed to fetch all ratings and reviews"
        })
    }
}


module.exports={createratingandreview , getAverageRating , getallratingandReview};

