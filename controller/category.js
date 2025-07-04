const categorymodel=require("../models/category");
const coursemodel= require("../models/course")
const mongoose= require("mongoose");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }


async function createcategory(req,res){
    try{
        // fetch data 
        const {name , description} = req.body;
        // validation
        if(!name || !description) {
            return res.status(400).json({
                success:false,
                message:"all fields for creating catergory are required"
            });
        }

        // creat entry of categories in db
        const categoriesdetails= await categorymodel.create (
            {
                name:name,
                description:description,
                courses:[]
            }
        );

        // console.log("categories details = > " , categoriesdetails);
        // return response

        return res.status(200).json({
            success:true,
            message:"categories created succesfully",
            categoriesdetail:categoriesdetails
        });


    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
            message:"unable to creat category"
        });
    }
}


// get all categories


async function showallcategory(req,res){
    try{
        // get all category but make sure all category contain name and description
       const allcategories=await categorymodel.find( {} , {name:true ,  description : true  , courses:true});
    
        // return response

        return res.status(200).json(
          {
            success:true,
            message:"categories fetched succesfully",
            allcategories:allcategories
          }
      );


    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
            message:"unable to fetch all categories"
        });
    }
}

// intent-to show different types of courses

// async function categorypageDetails(req, res){
//     try{
        
//         // get category id
//         const{categoryid} = req.body;
        
//         // get courses for specified category id
//         const selectedcategory=await categorymodel.findById(categoryid).populate("courses").exec();

//         console.log("selected categrory is " , selectedcategory);

//         // validation 
//         if(!selectedcategory){
//             return res.status(404).json({
//                 success:false,
//                 message:"Data not found"
//             });
//         }

//         // get courses for different categories
//         const differentcategories=await categorymodel.find(
//             // find data whose id is not equal to category id
//                                         {_id : {$ne :categoryid} },
//                                     ).populate("courses").exec();

//         // get top selling courses  =>HW
//         // return response

//         console.log("different categories = " , differentcategories)

//         return res.status(200).json({
//             success:true,
//             data:{
//                 selectedcategory,
//                 differentcategories,
//                 // topselling categoies 
//             }
//         })

//     } catch(error) {
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//             message:"unable to fetch courses for selected categories"
//         });
//     }
// }


async function categorypageDetails(req, res){
    try {
        const { categoryid } = req.body;
        
        // console.log("PRINTING CATEGORY ID: =", categoryid);
        // Get courses for the specified category
        const selectedCourses = await categorymodel.findById(categoryid)
          .populate({
            path: "courses",
            match: { status: "Published" },
            populate:"instructor"
          //   populate: "ratingAndReviews",

          })
          .exec()

       
        // console.log("SELECTED COURSE", selectedCourses)
        // Handle the case when the category is not found
        if (!selectedCourses) {
          console.log("Category not found.")
          return res
            .status(404)
            .json({ success: false, message: "Category not found" })
        }

        // Handle the case when there are no courses
        if (selectedCourses.courses.length === 0) {
          console.log("No courses found for the selected category.")
          return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
          })
        }

        // Get courses for other categories
        // it will return an array of those catgroies
        const categoriesExceptSelected = await categorymodel.find({
          _id: { $ne: categoryid },
          courses: { $not: { $size: 0 } }
        })

        // console.log("categoriesExceptSelected", categoriesExceptSelected)

        let differentCourses = await categorymodel.findOne(
          categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
            ._id
        ).populate({
            path: "courses",
            match: { status: "Published" },
            populate:"instructor"
          //   populate: "ratingAndReviews",
          }).exec()

        // console.log("Different COURSE", differentCourses)

        // Get top-selling courses across all categories
        const allCategories = await categorymodel.find({})
          .populate({
            path: "courses",
            match: { status: "Published" },
            populate:"instructor"
          //   populate: "ratingAndReviews",
          }).exec()

          
          // flatMap(): This method is used to map over each category, extract its courses array, and then flatten all the courses into a single array.
          // flatMap() behaves like .map() but flattens the resulting arrays into one combined array, avoiding nested arrays.
        const allCourses = allCategories.flatMap((category) => category.courses)

        // console.log("ALL COURSE", allCourses)

        // const mostSellingCourses = await coursemodel.find({ status: 'Published' })
        // .sort({ "studentsEnrolled.length": -1 }).populate("ratingAndReviews") // Sort by studentsEnrolled array length in descending order
        // .exec();

        const mostSellingCourses = await coursemodel.find({ status: 'Published' })
        .sort({ "studentsEnrolled.length": -1 }).populate("instructor").exec(); // Sort by studentsEnrolled array length in descending order
        
        // console.log("most selling COURSE", mostSellingCourses)

        res.status(200).json({

          success:true,
          selectedCourses: selectedCourses,
          differentCourses: differentCourses,
          allCourses,
          mostSellingCourses,
          name: selectedCourses.name,
          description: selectedCourses.description,
              
      })
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
}



module.exports={createcategory , showallcategory , categorypageDetails}