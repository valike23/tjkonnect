var Model = require("./classes");


let worker = {
    
    constructComment: function (results) {
        let comments = [];
        let comment = new  Model.comment;
        
        //    comment.comment = results[1].comment;
        //    comment.commentId = results[1].commentId;
        //    comment.contentId = results[1].contentId;
        //    comment.id = results[1].id;
        //    comment.userId = results[1].userId;
            
        //comments.push(comment);
        //comment.comment = results[0].comment;
        //comment.commentId = results[0].commentId;
        //comment.contentId = results[0].contentId;
        //comment.id = results[0].id;
        //comment.userId = results[0].userId;

        //comments.push(comment);
        //comment.comment = results[2].comment;
        //comment.commentId = results[2].commentId;
        //comment.contentId = results[2].contentId;
        //comment.id = results[2].id;
        //comment.userId = results[2].userId;

        //comments.push(comment);
            
           
       
        return results;
    }
}


module.exports = worker;