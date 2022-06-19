

//Initializing a folder for bookmarks when the extension is loaded

chrome.bookmarks.getChildren('2', function(children) {
  var flag=1;
    for (var i = 0; i < children.length; i++) {
        var bookmark = children[i];
        if (bookmark.title == 'Bookmarked Problems') {
          flag=0;
          break;
        }
    }
   if(flag==1)
   chrome.bookmarks.create({'parentId':'2','title':'Bookmarked Problems'});
   });


