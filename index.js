const contractSource = `
contract News =
  record article ={
    id:int,
    title:string,
    content:string,
    imageUrl:string,
    author:address,
    created:int
    }
  record state =
    {
    index_counter :int,
    articles : map(int,article)
    }
  entrypoint init() = 
    { articles = {}, 
      index_counter = 0}
  
   
  entrypoint getArticleLength():int =
    state.index_counter
  
  stateful entrypoint add_new_article(_title:string,_content:string,_imageUrl:string) =
    let timestamp= Chain.timestamp
    let article = {id=getArticleLength() + 1,title=_title, content=_content,imageUrl=_imageUrl,author=Call.caller,created=timestamp}
    let index = getArticleLength() + 1
    put(state{articles[index] = article, index_counter  = index})
  
  entrypoint get_article_by_index(index:int) : article = 
    switch(Map.lookup(index, state.articles))
      None => abort("Article does not exist with this index")
      Some(x) => x
      
  stateful entrypoint update_existing_article(_id:int, _title:string, _content:string, _imageUrl:string) =
    let article = get_article_by_index(_id)
    let updated_article = {id=_id,title=_title, content=_content,imageUrl=_imageUrl,author=article.author,created=Chain.timestamp}
    put(state{articles[_id] =  updated_article})
`


contractAddress = "ct_Ace1GDKjj7GN7hjMaSCfqTqkXZyBVumZLoByaXaAebtGUW6HS"
var client = null // client defuault null
var articleListArr = [] // empty arr
var articleListLength = 0 // empty product list lenghth

async function callStatic(func, args) {
    const contract = await client.getContractInstance(contractSource, {contractAddress});
    const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
    const decodedGet = await calledGet.decode().catch(e => console.error(e));
    return decodedGet;
}
  
  //Create a asynchronous write call for our smart contract
async function contractCall(func, args, value) {
    const contract = await client.getContractInstance(contractSource, {contractAddress});
    console.log("Contract:", contract)
    const calledSet = await contract.call(func, args, {amount:value}).catch(e => console.error(e));
    console.log("CalledSet", calledSet)
    return calledSet;
}



function renderArticleList(){
    let template = $('#template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, {articleListArr});
    $("#articleListBody").html(rendered);
    console.log("Mustashe Template Display")
}

// window onload event handler
window.addEventListener('load', async() => {
    $("#loader").show();
  
    client = await Ae.Aepp();
  
    articleListLength = await callStatic('getArticleLength',[]);
    
    console.log('Number Of Articles: ', articleListLength);
  
    for(let i = 1; i < articleListLength + 1; i++){
      const getArticleList = await callStatic('get_article_by_index', [i]);
      articleListArr.push({
        index_counter:i,
        id:getArticleList.id,
        title:getArticleList.title,
        content:getArticleList.content,
        url:getArticleList.imageUrl,
        author:getArticleList.author,
        created:new Date(getArticleList.created)
      })
    }
    renderArticleList();  
    $("#loader").hide();
  });

// create an article

  $('#addArticleBtn').click(async function(){
    $("#loader").show();
    console.log("Button Clicked")
    const new_article_title = ($('#title').val());
    const new_article_content = ($("#content").val());
    const new_article_image_url = ($("#url").val());
    console.log("-------------------------------------")
    console.log("Article Title:",new_article_title)
    console.log("Article Content:",new_article_content)
    console.log("Article Image Url:",new_article_image_url)
    const new_article = await contractCall('add_new_article', [new_article_title, new_article_content, new_article_image_url],0);
    console.log("SAVED TO THE DB", new_article)
    
    articleListArr.push({
        index_counter: articleListLength.length + 1,
        id:articleListLength.length + 1,
        title:new_article.title,
        content:new_article.content,
        author:new_article.author,
        imageUrl:new_article.imageUrl,
        created:new_article.created
    })
  
  
    renderArticleList();
    $("#loader").hide();
      //This will clear the value in all scenarious
      var title_input = document.getElementById("title")
        title_input.value =""
      var url_input = document.getElementById("url")
        url_input.value =""
      var content_input = document.getElementById("content")
        content_input.value = ""
    // e.preventDefault();
  
  });
  

// Buy A Product
// $("#articleListBody").on("click",".updateBtn", async function(event){
//     $("#loader").show();
  
//     const dataIndex = event.target.id
//     const purchased_article = await contractCall('update_existing_article', [dataIndex],0);
//     console.log("Purchase:", purchased_product)
    
//     // const foundIndex = productListArr.findIndex(product => product.id === dataIndex)
//     // const value = $(".buyBtn")[foundIndex] ;
  
//     console.log("-----------------")
//     console.log("Data Index:", dataIndex)
//     console.log("--------------------------")
    
//     console.log("Just Clicked The Buy Button")
//     event.preventDefault();
//   });
  
