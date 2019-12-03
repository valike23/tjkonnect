let classes = {
    subscription: function (subscriber,subscribee, notification ) {
        this.subscriber = subscriber;
        this.subscribee = subscribee;
        this.notification = notification;

    },
    promoted: function (content, promoter, promotee, paymentId, duration, cost, promotedDate) {
        this.contentId = content;
        this.promoter = promoter;
        this.promotee = promotee;
        this.duration = duration;
        this.cost = cost;
      
        this.payment = paymentId;
       
        
  
    },
    comment: function (username, comment, contentId, replies, profilePics) {
        this.id = "tjc" + (new Date() - 1).toString();
        this.profilePics = profilePics;
        this.username = username;         
        this.comment = comment;
        this.contentId = contentId;
        this.replies = replies;
        this.created = new Date()
    },
    reply: function (username, comment, replying, profilePics) {
        this.profilePics = profilePics;
        this.username = username;
        this.replying = replying;
        this.comment = comment;
        this.created = new Date();
        
    },
    competition: function (name, organizer, startDate, endDate, banner, allowBand, costBand, costUser,hash) {
        this.name = name;
        this.organizer = organizer;
        this.startDate = startDate;
        this.endDate = endDate;
        this.banner = banner;
        this.allowBand = allowBand;
        this.costBand = costBand;
        this.costUser = costUser;
        this.hashtag = hash;
        this.competitionId = "tjKon" + Date.now();
    },
    content: function (name, src,thumbnail,contentType, uploader, secured, duration,hashTag,public_id,t_id) {
        this.name = name;
        this.src = src;
        this.thumbnail = thumbnail;
        this.contentType = contentType;
        this.uploader = uploader;
        this.securedSrc = secured;
        this.duration = duration;
            this.public_id = public_id;
        this.hashTag = hashTag;
        this.banner_public_id = t_id;
    },
    notification: function (message, user) {
        this.message = message;
        this.userId = user;
    }
}
module.exports = classes;