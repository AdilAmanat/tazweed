$(document).ready(function () {

  $('#tags').tagsInput({
    'height':'60px',
    'width':'280px'
  });

  $(".action-btn").click(function(){
    const id = $(this).data('id');
    $.post('/invitation/'+id+'/state',{
      _method:'patch',
      'state':$(this).val()
    },function(resp,textStats,jqXHR){
      if(jqXHR.status === 200)
      {
        window.location.reload();
        return false;
      }

      alert('done');

    })
  });

});
