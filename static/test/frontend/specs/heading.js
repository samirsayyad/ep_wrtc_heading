describe("WebRTC Heading", function(){

  //create a new pad before each test run
  beforeEach(function(cb){
    testPad = helper.newPad(cb);
    this.timeout(60000);
  });

  // Create Pad
   // Check Default Pad Title is Untitled
    // Set Pad title & Ensure it's right
     // Re-open Pad and check Pad Title is stored.

  it("create new Header", function(done) {
    var inner$ = helper.padInner$;
    var chrome$ = helper.padChrome$;
		var flag = 0
    Array(6).fill(0).map((val) => {
			flag++

			inner$("div").eq(flag).sendkeys("New Header"+(flag)+"\n"); // insert the string
			inner$("div").eq(flag).sendkeys('{selectall}'); // select all
			chrome$('#heading-selection').val("5").change();

			inner$("div").eq(flag+3).sendkeys('\n In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.')
			// inner$("div").eq(flag).sendkeys('{enter}');



	
		})


		done()
  });

  // it("Check updating pad title to 'JohnMcLear' works", function(done) {
  //   this.timeout(60000);
  //   var chrome$ = helper.padChrome$;
  //   var $editorContainer = chrome$("#editorcontainer");
  //   chrome$("#edit_title").click();
  //   chrome$("#input_title").val("JohnMcLear");
  //   chrome$("#save_title").click();

  //   helper.waitFor(function(){
  //     console.log(chrome$("#pad_title > #title > h1").text());
  //     return chrome$("#pad_title > #title > h1").text() === "JohnMcLear";
  //   }).done(function(){
  //      expect(chrome$("#pad_title > #title > h1").text()).to.be("JohnMcLear");
  //      done();
  //   });

  // });

});
