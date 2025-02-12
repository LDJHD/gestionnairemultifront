$(document).ready(function(){

  $('#LOG').append( '<h3>START</h3>' );
  
  var putFinalize = function(uid){
    $('#LOG').append( 'Finalize '+uid );

    $.ajax({
      type: 'PUT',
      url: 'https://developper.impots.bj/sygmef-emcf/api/invoice/'+uid+'/confirm',
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Authorization':'Bearer XXXXXXXXXXXXX.XXXXXXXXXXXXX.XXXXXXXXXXXX'//your API TOKEN here
      },

      success: function(data) {
         $('#LOGINVOICE').append( '<p style="color: green;">SecurityElementsDto: '+JSON.stringify(data, null, 4)+'</p>' );
         $('#LOGINVOICE').append( '<p>END</p>' );
      },

      error: function(jqxhr, settings, ex) {
        alert('failed, ' + ex); 
        console.log(jqxhr);
      }
    });  
  
  };
  
  var getInvoiceDetailsDto = function(uid){
    $('#LOG').append( 'Finalize '+uid );

    $.ajax({
      type: 'GET',
      url: 'https://developper.impots.bj/sygmef-emcf/api/invoice/'+uid,
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Authorization':'Bearer XXXXXXXXXXXXX.XXXXXXXXXXXXX.XXXXXXXXXXXX'//your API TOKEN here
      },

      success: function(data) {
         $('#LOGINVOICE').append( '<p style="color: green;">InvoiceDetailsDto: '+JSON.stringify(data, null, 4)+'</p>' );
         putFinalize(uid);
      },

      error: function(jqxhr, settings, ex) {
        alert('failed, ' + ex); 
        console.log(jqxhr);
      }
    });  
  
  };
  
  var postInvoiceRequestDto = function(){
    invoiceRequestDto = {
       "ifu":"XXXXXXXXXXXXX",//YOUR IFU HERE
       "type":"FV",
       "items":[
          {
             "name":"Jus d'orange",
             "price":1800,
             "quantity":2,
             "taxGroup":"B"
          },
          {
             "name":"Article exonere",
             "price":600,
             "quantity":2.5,
             "taxGroup":"A"
          }
       ],
       "operator":{
          "name":"Test"
       }
    };
    console.log(invoiceRequestDto);

    $('#LOG').append( '<p>InvoiceRequestDto: '+JSON.stringify(invoiceRequestDto, null, 4)+'</p>' );
    $.ajax({
      type: 'POST',
      url: 'https://developper.impots.bj/sygmef-emcf/api/invoice',
      contentType: 'application/json',
      data: JSON.stringify(invoiceRequestDto),
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Authorization':'Bearer XXXXXXXXXXXXX.XXXXXXXXXXXXX.XXXXXXXXXXXX'//your API TOKEN here
      },

      success: function(data) {
         $('#LOGINVOICE').append( '<p style="color: green;">InvoiceResponseDto: '+JSON.stringify(data, null, 4)+'</p>' );
         if (data.uid!=null){
          getInvoiceDetailsDto(data.uid);
         }
      },

      error: function(jqxhr, settings, ex) {
        alert('failed, ' + ex); 
        console.log(jqxhr);
      }
    });
  };
  
  var getStatusResponseDto = function(){
    $.ajax({
      type: 'GET',
      url: 'https://developper.impots.bj/sygmef-emcf/api/invoice',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Authorization':'Bearer XXXXXXXXXXXXX.XXXXXXXXXXXXX.XXXXXXXXXXXX'//your API TOKEN here
      },
      
      success: function(data) {
         $('#LOGINVOICE').append( '<p style="color: green;">StatusResponseDto: '+JSON.stringify(data, null, 4)+'</p>' );
         postInvoiceRequestDto();
      },

      error: function(jqxhr, settings, ex) {
        alert('failed, ' + ex); 
        console.log(jqxhr);
      }
    });
  };
  
  var getPaymentTypesDto = function(){
    $.ajax({
      type: 'GET',
      url: 'https://developper.impots.bj/sygmef-emcf/api/info/invoiceTypes',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Authorization':'Bearer XXXXXXXXXXXXX.XXXXXXXXXXXXX.XXXXXXXXXXXX'//your API TOKEN here
      },
      
      success: function(data) {
         $('#LOGINFO').append( '<p style="color: blue;">PaymentTypesDto: '+JSON.stringify(data, null, 4)+'</p>' );
      },

      error: function(jqxhr, settings, ex) {
        alert('failed, ' + ex); 
        console.log(jqxhr);
      }
    });
  };
  
  var getTaxGroupsDto = function(){
    $.ajax({
      type: 'GET',
      url: 'https://developper.impots.bj/sygmef-emcf/api/info/taxGroups',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Authorization':'Bearer XXXXXXXXXXXXX.XXXXXXXXXXXXX.XXXXXXXXXXXX'//your API TOKEN here
      },
      
      success: function(data) {
         $('#LOGINFO').append( '<p style="color: blue;">TaxGroupsDto: '+JSON.stringify(data, null, 4)+'</p>' );
         getPaymentTypesDto();
      },

      error: function(jqxhr, settings, ex) {
        alert('failed, ' + ex); 
        console.log(jqxhr);
      }
    });
  };
  
   var getInvoiceTypesDto = function(){
    $.ajax({
      type: 'GET',
      url: 'https://developper.impots.bj/sygmef-emcf/api/info/invoiceTypes',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Authorization':'Bearer XXXXXXXXXXXXX.XXXXXXXXXXXXX.XXXXXXXXXXXX'//your API TOKEN here
      },
      
      success: function(data) {
         $('#LOGINFO').append( '<p style="color: blue;">InvoiceTypesDto: '+JSON.stringify(data, null, 4)+'</p>' );
         getTaxGroupsDto();
      },

      error: function(jqxhr, settings, ex) {
        alert('failed, ' + ex); 
        console.log(jqxhr);
      }
    });
  };
  
  var getInfoReponseDto = function(){
    $.ajax({
      type: 'GET',
      url: 'https://developper.impots.bj/sygmef-emcf/api/info/status',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Authorization':'Bearer XXXXXXXXXXXXX.XXXXXXXXXXXXX.XXXXXXXXXXXX'//your API TOKEN here
      },
      
      success: function(data) {
         $('#LOGINFO').append( '<p style="color: blue;">InfoReponseDto: '+JSON.stringify(data, null, 4)+'</p>' );
         getInvoiceTypesDto();
      },

      error: function(jqxhr, settings, ex) {
        alert('failed, ' + ex); 
        console.log(jqxhr);
      }
    });
  };
  
  var start = function(){
    //INFO
    $('#LOGINFO').append( '<p style="color: orangered;">INFO API</p>' );
    getInfoReponseDto();
    //INVOICE
    $('#LOGINVOICE').append( '<p style="color: orangered;">INVOICE API</p>' );
    getStatusResponseDto();
  };
  
  //start
  start();
  
  

});