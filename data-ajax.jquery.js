var CONFIG = {
	baseurl:window.location.protocol+'//' + window.location.hostname,
	ajax_path:'/ajax?',
	timeout: 1000*30,
	input: {
		erro: {
			classe:'c-erro',
			icone:{
				classe:'', // icons
				caractere:'' // 
			}
		}
	},
	form:{
		erro:{
			titulo:'Ops', // sweetalert
			mensagem:'Preencha todos os campos.'
		}
	},
	ajax:{
		erro:{
			titulo:'Ops', // sweetalert
			mensagem:'Algo errado. Tente novamente.',
			segundos:5
		},
		sucesso:{
			titulo:'Sucesso', // sweetalert
			mensagem:'Dados salvos com sucesso.',
			segundos:5
		},
		carregando:{
			titulo:'Ainda carregando', // sweetalert
			mensagem:'Aguarde...', // Ainda carregando...
			segundos:1.5 // tempo para mostrar a mensagem
		},
		upload:{
			mensagem:'Enviando arquivos', // +' (99%)'
			segundos:0.1, // tempo para mostrar a mensagem
			timeout:'Arquivo muito grande, reduza o tamanho.',
		}
	},
	sweetalert: true,
	alerta:{
		padrao:{
			fundo:'#F1C905',
			fonte:'#FFF',
			classe:'alerta-fixo',
		},
		erro:{
			fundo:'#bc2b14',
			fonte:'#FFF',
			classe:'alerta-erro',
		},
		sucesso:{
			fundo:'#a6cf4f',
			fonte:'#FFF',
			classe:'alerta-sucesso'
		}
	},
	alerta_interno:{
		visivel:{"display":"block"},
		invisivel:{"display":"none"}
	}
}

dataajaxcss=(function(){
	var cssHtml = '';
	cssHtml += '.'+CONFIG.alerta.padrao.classe+'{position: fixed;z-index: 99999;width: 100%;min-height: 40px;line-height: 38px;text-align: center;left: 0px;border: 0px;color: #FFF;font-size: 14px;font-weight: 700;}';
	cssHtml += '.'+CONFIG.alerta.padrao.classe+'{background-color:'+CONFIG.alerta.padrao.fundo+';color:'+CONFIG.alerta.padrao.fonte+';}';
	cssHtml += '.'+CONFIG.alerta.sucesso.classe+'{background-color:'+CONFIG.alerta.sucesso.fundo+';color:'+CONFIG.alerta.sucesso.fonte+';}';
	cssHtml += '.'+CONFIG.alerta.erro.classe+'{background-color:'+CONFIG.alerta.erro.fundo+';color:'+CONFIG.alerta.erro.fonte+';}';
	if(CONFIG.sweetalert)
		cssHtml += '.swal2-container.swal2-shown{z-index:99999999}';
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = cssHtml;
	document.getElementsByTagName('head')[0].appendChild(style);
	return true;
})();

function bind_forms_data(debug){
	var debug = typeof debug === "undefined" ? false : debug;
	$(function() {

		$(document).off('keypress.dataajax').on('keypress.dataajax',function(e) {
			if(e.which == 13) {
				if(!$(e.target).is('input[type=text]')) return true;
				if($(e.target).closest('form[data-ajax]').length){
					$(e.target).closest('form[data-ajax]').each(function(){
						$(this).submit();
					})
				}
			}
		});

		$.each($('[data-ajax-action]'), function(i,e){
			$(this).on('click.dataajax',function(){
				$e = $(e);
				if($(this).data('locked')) return false;
				$(this).data('locked',true);

				var data = {};
				var action = $.trim($e.attr('data-ajax-action'));
				var callback = function(){};

				if($e.is('[data-ajax-data]') && $e.data('ajax-data'))
					data = $e.data('ajax-data');

				if(typeof data !== "object")
					data = {};

				var atributos = $e.get(0).attributes;
				$.each(atributos,function(i,e){
					if(e.specified != true) return true;
					var name = e.name;
					if(name.includes('data-ajax-var-')){
						name = name.replace('data-ajax-var-','');
						var value = e.value;
						try {
							var eval_value = eval(value);
							data[name] = eval_value;
						}
						catch (e) {}
					}
					if(name.includes('data-ajax-string-')){
						name = name.replace('data-ajax-string-','');
						var value = e.value;
						data[name] = value;
					}
				});

				if($e.is('[data-ajax-callback]')){
					callback_name = $e.attr('data-ajax-callback');
					callback = (typeof window['callback_'+callback_name] !== "undefined" && window['callback_'+callback_name] !== "undefined" ? window['callback_'+callback_name] : function(r){});

				}

				var alerta_carregando = null;
				var alerta_sucesso = null;
				var alerta_erro = null;
				if($e.is('[data-ajax-div-carregando]')) alerta_carregando = $($e.attr('data-ajax-div-carregando'));
				if($e.is('[data-ajax-div-sucesso]')) alerta_sucesso = $($e.attr('data-ajax-div-sucesso'));
				if($e.is('[data-ajax-div-erro]')) alerta_erro = $($e.attr('data-ajax-div-erro'));

				var aindaSalvando = setTimeout(function(){
					if(aindaSalvando)
						alerta(null,CONFIG.ajax.carregando.mensagem,null,null,'proximo', null,alerta_carregando,alerta_sucesso,alerta_erro, true);
				},CONFIG.ajax.carregando.segundos*1000);
				
				var swal_callback = function(){};

				var alerta_div_top = $e;
				var alerta_carregando = null;
				var alerta_sucesso = null;
				var alerta_erro = null;
				if($e.is('[data-ajax-div-carregando],[data-ajax-div-sucesso],[data-ajax-div-erro]')){
					alerta_div_top = null;
					if($e.is('[data-ajax-div-carregando]')) alerta_carregando = $($e.attr('data-ajax-div-carregando'));
					if($e.is('[data-ajax-div-sucesso]')) alerta_sucesso = $($e.attr('data-ajax-div-sucesso'));
					if($e.is('[data-ajax-div-erro]')) alerta_erro = $($e.attr('data-ajax-div-erro'));
				}else{
					if($e.find('[data-ajax-carregando]').length) alerta_carregando = $($e).find('[data-ajax-carregando]');
					if($e.find('[data-ajax-sucesso]').length) alerta_sucesso = $($e).find('[data-ajax-sucesso]');
					if($e.find('[data-ajax-erro]').length) alerta_erro = $($e).find('[data-ajax-erro]');
				}

				ajax_form_json(action,data,
					function(data){
						clearTimeout(aindaSalvando);
						if(CONFIG.sweetalert)
							swal.close();
						
						if(CONFIG.sweetalert && !$e.is('[data-ajax-sem-mensagem="sucesso"],[data-ajax-sem-mensagem=""]')){
							swal_callback = function(){
								if(callback) callback($e,data,true);
							};
						}else{
							if(callback) callback($e,data,true);
						}

						if(!$e.is('[data-ajax-sem-mensagem="sucesso"],[data-ajax-sem-mensagem=""]')){
							var _title = data&&data.title?data.title:CONFIG.ajax.sucesso.titulo;
							var _msg = data&&data.msg?data.msg:CONFIG.ajax.sucesso.mensagem;
							alerta(CONFIG.alerta.sucesso.classe,(_title&&_msg?[_title,_msg]:_msg),null,null,CONFIG.ajax.sucesso.segundos*1000, alerta_div_top,alerta_carregando,alerta_sucesso,alerta_erro,false,swal_callback);
						}else{
							$('[data-alerta-sumir-no-proximo]').animate({
								bottom: '-'+$(this).outerHeight()+'px'
							},'normal',function(){
								$(this).remove();
							});
						}

						aindaSalvando = false;
						if(!$e.is('[data-ajax-once]'))
							$e.removeData('locked');
					},function(data){
						clearTimeout(aindaSalvando);
						aindaSalvando = false;
						if(!$e.is('[data-ajax-sem-mensagem="erro"],[data-ajax-sem-mensagem=""]')){
							var _title = data&&data.title?data.title:CONFIG.ajax.erro.titulo;
							var _msg = data&&data.msg?data.msg:CONFIG.ajax.erro.mensagem;
							alerta(CONFIG.alerta.erro.classe,(_title&&_msg?[_title,_msg]:_msg),null,null,CONFIG.ajax.erro.segundos*1000, null,alerta_carregando,alerta_sucesso,alerta_erro,false,swal_callback);
						}else{
							$('[data-alerta-sumir-no-proximo]').animate({
								bottom: '-'+$(this).outerHeight()+'px'
							},'normal',function(){
								$(this).remove();
							});
						}
						if(CONFIG.sweetalert && !$e.is('[data-ajax-sem-mensagem="sucesso"],[data-ajax-sem-mensagem=""]')){
							swal_callback = function(){
								if(callback) callback($e,data,false);
							};
						}else{
							if(callback) callback($e,data,false);
						}
						if($e.data('locked'))
							$e.removeData('locked');
					}
				);
			});

		}).css('cursor','pointer');
		
		$.each($('form[data-ajax]'),function(i,e){
			var $form = $(this);
			$form.off('submit.dataajax').on('submit.dataajax',function(){
				if($form.data('locked')) return false;
				var form_erro = false;
				if(CONFIG.input.erro.icone.classe)
					$('.'+CONFIG.input.erro.icone.classe,$form).remove();
				if(CONFIG.input.erro.classe)
				$('.'+CONFIG.input.erro.classe).removeClass(CONFIG.input.erro.classe);
				var adicionar_icone_erro = (function(input){
					if(CONFIG.input.erro.icone.caractere){
						// input.before('<div style="display:none;" class="inp-erro-i"><div class="'+CONFIG.input.erro.icone.classe+'">'+CONFIG.input.erro.icone.caractere+'</div></div>').prev().fadeIn();
						input.before('<div class="input-icon-error cart-payment '+CONFIG.input.erro.icone.classe+'"><div class="icon">'+CONFIG.input.erro.icone.caractere+'</div></div>').prev().css('display','flex');

					}
				});
				$.each($('[data-required]',$form),function(){
					var $input = $(this);
					if($input.is('[type="checkbox"]') && !$input.is(':checked')){
						$input.before('<input type="hidden" name="'+$input.attr('name')+'" value="" data-required data-ajax-auto-generated-validator>');
					}
					if($input.is('[type="file"]') && !$input.val()){
						$input.before('<input type="hidden" name="'+$input.attr('name')+'" value="" data-required data-ajax-auto-generated-validator>');
					}
				});


				var data = $form.formToData();

				$.each(data,function(name,value){
					var $input = $('[name="'+name+'"]',$form);

					if($input.is('[data-required]')){
						if(!value || !value.length){
							if(debug)
								console.log(name,value);

							form_erro = true;
							$input.addClass(CONFIG.input.erro.classe);
							if($input.closest('[data-ajax-validacao]').length)
								$input.closest('[data-ajax-validacao]').addClass(CONFIG.input.erro.classe);
							if($input.closest('.input-special').length)
								$input.siblings('label:eq(0)').addClass(CONFIG.input.erro.classe);
							if(!$input.is('[type="radio"],[type="checkbox"]')){
								adicionar_icone_erro($input);
							}
						}
					}
				});

				$.each($('[data-required]:not([name])',$form),function(element,index){
					var $input = $(this,$form);
					var value = $input.val();
					if(!value || !value.length){
						form_erro = true;
						if($input.closest('[data-ajax-validacao]').length)
							$input.closest('[data-ajax-validacao]').addClass(CONFIG.input.erro.classe);
						if($input.closest('.input-special').length)
							$input.siblings('label:eq(0)').addClass(CONFIG.input.erro.classe);
						$input.addClass(CONFIG.input.erro.classe);
						if(!$input.is('[type="radio"],[type="checkbox"]'))
							adicionar_icone_erro($input);
					}
				});

				$('[data-ajax-auto-generated-validator]',$form).remove();

				var markInput = function(inp,status){
					if(!status) status = 'erro';
					if(typeof inp == 'string')
						inp = $(inp);
					inp.addClass(CONFIG.input[status].classe);
					if(inp.closest('[data-ajax-validacao]').length)
						inp.closest('[data-ajax-validacao]').addClass(CONFIG.input[status].classe);
					if(inp.closest('.input-special').length)
						inp.siblings('label:eq(0)').addClass(CONFIG.input[status].classe);
				}

				var before_callback = function(r){};
				if($form.is('[data-ajax-callback]')){
					var callback = $form.attr('data-ajax-callback').replace(/^callback_/, '');
					var before_callback = (typeof window['callback_'+callback] !== "undefined" && window['callback_'+callback].before !== "undefined" ? window['callback_'+callback].before : function(r){});
				}

				var _alerta_erro = {
					titulo: '',
					mensagem: ''
				};
				var formData = new FormData($($form)[0]);
				var cb = before_callback($form,formData,markInput,_alerta_erro);
				if(cb === false || cb === 0)
					form_erro=true;
				else if(cb)
					formData = cb;

				if(!_alerta_erro.titulo.length && !_alerta_erro.mensagem.length)
					_alerta_erro = false;

				// TODO: pensar em remover o callback input_erro

				if($form.is('[data-ajax-callback]')){
					var callback = $form.attr('data-ajax-callback').replace(/^callback_/, '');

					var sucesso_callback = (typeof window['callback_'+callback] !== "undefined" && window['callback_'+callback].sucesso !== "undefined" ? window['callback_'+callback].sucesso : function(r){});
					var erro_callback = (typeof window['callback_'+callback] !== "undefined" && window['callback_'+callback].erro !== "undefined" ? window['callback_'+callback].erro : function(r){});
					var input_erro_callback = (typeof window['callback_'+callback] !== "undefined" && window['callback_'+callback].input_erro !== "undefined" ? window['callback_'+callback].input_erro : function(r){});

					var after_callback = (typeof window['callback_'+callback] !== "undefined" && window['callback_'+callback].after !== "undefined" ? window['callback_'+callback].after : function(r){});
				}else{
					var sucesso_callback = function(r){};
					var erro_callback = function(r){};
					var input_erro_callback = function(r){};

					var after_callback = function(r){};
				}

				var alerta_div_top = $form;
				var alerta_carregando = null;
				var alerta_sucesso = null;
				var alerta_erro = null;
				if($form.is('[data-ajax-div-carregando],[data-ajax-div-sucesso],[data-ajax-div-erro]')){
					alerta_div_top = null;
					if($form.is('[data-ajax-div-carregando]')) alerta_carregando = $($form.attr('data-ajax-div-carregando'));
					if($form.is('[data-ajax-div-sucesso]')) alerta_sucesso = $($form.attr('data-ajax-div-sucesso'));
					if($form.is('[data-ajax-div-erro]')) alerta_erro = $($form.attr('data-ajax-div-erro'));
				}else{
					if($form.find('[data-ajax-carregando]').length) alerta_carregando = $($form).find('[data-ajax-carregando]');
					if($form.find('[data-ajax-sucesso]').length) alerta_sucesso = $($form).find('[data-ajax-sucesso]');
					if($form.find('[data-ajax-erro]').length) alerta_erro = $($form).find('[data-ajax-erro]');
				}

				if(!form_erro){

					if($form.is('[data-ajax-get]')){
						if($form.attr('data-ajax-get') == 'stay'){
							window.history.pushState("", "", [CONFIG.baseurl, location.pathname].join('')+'?'+$form.serialize());
						}else{
							var action = $form.is('[action]')?$form.attr('action'):$form.attr("data-ajax");
							window.location.href = CONFIG.baseurl+action+'?'+$form.serialize();
							return true;
						}
					}

					var upload = $form.is('[data-ajax-upload]');
					if(upload){
						CONFIG.ajax.carregando.segundos = CONFIG.ajax.upload.segundos;
						CONFIG.ajax.carregando.mensagem = CONFIG.ajax.upload.mensagem;
					}

					var lock_form = false;
					if($form.is('[data-ajax-once]'))
						lock_form = true;

					$form.data('locked',1);

					var aindaSalvando = setTimeout(function(){
						if(aindaSalvando)
							alerta(null,CONFIG.ajax.carregando.mensagem,null,null,'proximo', alerta_div_top,alerta_carregando,alerta_sucesso,alerta_erro, true);
					},CONFIG.ajax.carregando.segundos*1000);

					if(CONFIG.sweetalert && typeof swal !== "undefined" && swal.getContent()){
						$('#swal2-content', swal.getContent()).html(percentComplete+'%');
					}

					var swal_callback = function(){};

					ajax_form($form.attr("data-ajax"),formData,
						function(data){
							clearTimeout(aindaSalvando);
							aindaSalvando = false;
							if(CONFIG.sweetalert)
								swal.close();
							

							if(CONFIG.sweetalert && !$form.is('[data-ajax-sem-mensagem="sucesso"],[data-ajax-sem-mensagem=""]')){
								swal_callback = function(){
									if(sucesso_callback) sucesso_callback(data,$form,markInput);
									if(after_callback) after_callback($form);
								};
							}else{
								if(sucesso_callback) sucesso_callback(data,$form,markInput);
								if(after_callback) after_callback($form);
							}

							if(!$form.is('[data-ajax-sem-mensagem="sucesso"],[data-ajax-sem-mensagem=""]')){
								var _title = data&&data.title?data.title:CONFIG.ajax.sucesso.titulo;
								var _msg = data&&data.msg?data.msg:CONFIG.ajax.sucesso.mensagem;
								alerta(CONFIG.alerta.sucesso.classe,(_title&&_msg?[_title,_msg]:_msg),null,null,CONFIG.ajax.sucesso.segundos*1000, alerta_div_top,alerta_carregando,alerta_sucesso,alerta_erro,false,swal_callback);
							}else{
								$('[data-alerta-sumir-no-proximo]').animate({
									bottom: '-'+$(this).outerHeight()+'px'
								},'normal',function(){
									$(this).remove();
								});
							}
							if(!lock_form)
								$form.removeData('locked');
						},function(data){
							clearTimeout(aindaSalvando);
							aindaSalvando = false;
							if(CONFIG.sweetalert)
								swal.close();
							
							if(CONFIG.sweetalert && !$form.is('[data-ajax-sem-mensagem="erro"],[data-ajax-sem-mensagem=""]')){
								swal_callback = function(){
									if(erro_callback) erro_callback(data,$form,markInput);
									if(after_callback) after_callback($form);
								};
							}else{
								if(erro_callback) erro_callback(data,$form,markInput);
								if(after_callback) after_callback($form);
							}

							if(!$form.is('[data-ajax-sem-mensagem="erro"],[data-ajax-sem-mensagem=""]')){
								var _title = data&&data.title?data.title:CONFIG.ajax.erro.titulo;
								var _msg = data&&data.msg?data.msg:CONFIG.ajax.erro.mensagem;
								alerta(CONFIG.alerta.erro.classe,(_title&&_msg?[_title,_msg]:_msg),null,null,CONFIG.ajax.erro.segundos*1000, alerta_div_top,alerta_carregando,alerta_sucesso,alerta_erro,false,swal_callback);
							}else{
								$('[data-alerta-sumir-no-proximo]').animate({
									bottom: '-'+$(this).outerHeight()+'px'
								},'normal',function(){
									$(this).remove();
								});
							}

							if($form.data('locked'))
								$form.removeData('locked');

							if(data && data['#fields_error']){
								if(typeof data['#fields_error'] == 'string')
									data['#fields_error'] = data['#fields_error'].split(',');
								$.each(data['#fields_error'], function(i,e){
									markInput($('[name="'+e+'"]',$form));
								});
							}
						},undefined,
						upload
					);
				}else{
					clearTimeout(aindaSalvando);
					aindaSalvando = false;
					if(CONFIG.sweetalert)
						swal.close();
					
					if(!$form.is('[data-ajax-sem-mensagem="erro"],[data-ajax-sem-mensagem=""]')){

						// TODO: pensar em remover esse atributo [data-ajax-erro-mensagem]

						var _title = CONFIG.form.erro.titulo;
						var _msg = $form.is('[data-ajax-erro-mensagem]')?$form.is('[data-ajax-erro-mensagem]'):CONFIG.form.erro.mensagem;
						if(_alerta_erro !== false){
							if(_alerta_erro.titulo.length)
								_title = _alerta_erro.titulo;
							if(_alerta_erro.mensagem.length)
								_msg = _alerta_erro.mensagem;
						}

						alerta(CONFIG.alerta.erro.classe,(_title&&_msg?[_title,_msg]:_msg),null,null,CONFIG.ajax.erro.segundos*1000, alerta_div_top,alerta_carregando,alerta_sucesso,alerta_erro);
					}
				}
				return false;
			});

			$('[data-submit]',$form).off('click.dataajax').on('click.dataajax',function(){
				$form.submit();
				return false;
			}).data('submit-binded',1);
		});

		$('[data-submit]').each(function(){
			if($(this).data('submit-binded')) return false;

			$(this).on('click.dataajax',function(){
				ele = $($(this).attr('data-submit'));
				$(ele).submit();
				return false;
			});

		}).data('submit-binded',1);

	});
}
var data_ajax = bind_forms_data;

function ajax_form_json(url,data,success,error,deep_error,upload){
	return ajax_form(url,data,success,error,deep_error,upload,true);
}

function ajax_form(url,data,success,error,deep_error,upload,json){
	data = typeof data == "undefined"?{}:data;
	success = typeof success == "undefined"?(function(){}):success;
	error = typeof error == "undefined"?(function(){}):error;
	deep_error = typeof deep_error == "undefined"?(function(r){console.log('Deep ajax error or not json at '+url,data,r);error(r);}):deep_error;
	upload = typeof upload == "undefined"?false:upload;
	json = typeof json == "undefined"?false:json;

	var config = {
		type: 'POST',
		url: CONFIG.baseurl+CONFIG.ajax_path+url,
		dataType: 'json',
		cache: false,
		processData: json,
		timeout: CONFIG.timeout?CONFIG.timeout:5*60*1000,
		data: data,
		error:function(r, status){
			if(upload && status == 'timeout')
				r.msg = CONFIG.ajax.upload.timeout;

			deep_error(r);
		},
		success: function(data, status){
			if(upload && status == 'timeout')
				r.msg = CONFIG.ajax.upload.timeout;
			
			if(!data || !data.status)
				error(data);
			else
				success(data);
		}
	};
	if(!json)
		config.contentType=false;

		
	if(upload){
		config.xhr = function(){
		    var jqXHR = null;
		    if(window.ActiveXObject)
		        jqXHR = new window.ActiveXObject("Microsoft.XMLHTTP");
		    else
		        jqXHR = new window.XMLHttpRequest();

		    jqXHR.upload.addEventListener("progress",function (evt){
		        if(evt.lengthComputable ){
		            var percentComplete = Math.round((evt.loaded * 100) / evt.total);
		            if($('body').find("[data-ajax-loading]").length)
		            	$('body').find("[data-ajax-loading]").text(CONFIG.ajax.carregando.mensagem+' ('+percentComplete+'%)');
		            if(CONFIG.sweetalert && typeof swal !== "undefined" && swal.getContent())
		            	$('#swal2-content', swal.getContent()).html(percentComplete+'%');
		        }
		    }, false );		   
		    return jqXHR;
		};
	}

	$.ajax(config);
}

function alerta(classe,mensagem,scrollTo,direction,time, div_top,div_carregando,div_sucesso,div_erro, ainda_carregando, swal_callback){
	classe = typeof classe === "undefined"?'':classe;
	title = null;
	mensagem = typeof mensagem === "undefined"?'':mensagem;
	if(typeof mensagem === typeof []){
		if(mensagem.length == 2){
			title = mensagem[0];
			mensagem = mensagem[1];
		}else{
			mensagem = mensagem[0];
		}
	}
	direction = typeof direction === "undefined"?'bottom':direction;
	scrollTo = typeof scrollTo === "undefined"?false:scrollTo;
	time = typeof time === "undefined"?5000:time;

	div_top = typeof div_top === "undefined"?null:div_top;
	div_carregando = typeof div_carregando === "undefined"?null:div_carregando;
	div_sucesso = typeof div_sucesso === "undefined"?null:div_sucesso;
	div_erro = typeof div_erro === "undefined"?null:div_erro;

	ainda_carregando = typeof ainda_carregando === "undefined"?false:ainda_carregando;

	if(scrollTo)
		$("html,body").animate({scrollTop:scrollTo.offset().top},'5000');

	if(!div_carregando&&!div_sucesso&&!div_erro){
		if(CONFIG.sweetalert && typeof Swal === typeof function(){}){
			var state = 'info';
			if(classe == CONFIG.alerta.sucesso.classe)
				state = 'success';
			else if(classe == CONFIG.alerta.erro.classe)
				state = 'error';

			var swal_conf = {
				type: state,
				html: mensagem,
			}

			if(title)
				swal_conf.title = title;

			if(ainda_carregando){
				if(CONFIG.ajax.carregando.titulo){
					swal_conf.title = CONFIG.ajax.carregando.titulo;
					swal_conf.html = CONFIG.ajax.carregando.mensagem;
				}else{
					swal_conf.title = CONFIG.ajax.carregando.mensagem;
					swal_conf.html = '';
				}
				swal_conf.allowOutsideClick = false;
				swal_conf.allowEscapeKey = false;
				swal_conf.allowEnterKey = false;
				swal_conf.showConfirmButton = false;
				swal_conf.onOpen = function(){
					swal.showLoading();
				};
			}

			if(swal_callback){
				swal_conf.onClose = function(){
					swal_callback();
				}
			}

			Swal.fire(swal_conf);
			return true;
		}
		if(direction == 'top'){
			var alerta = $(document.createElement('div')).css('border-bottom-width','1px').addClass(''+CONFIG.alerta.padrao.classe+' '+(classe?classe:'')).text(mensagem?mensagem:'').attr('data-ajax-loading','1').appendTo('body')[0];
			$(alerta).css('top','-'+$(alerta).outerHeight()+'px');
			$(alerta).animate({
				top: '0px'
			},'fast',function(){
				$('[data-alerta-sumir-no-proximo]').remove();
				if(time!='proximo'){
					setTimeout(function(){
						$(alerta).animate({
							top: '-'+$(alerta).outerHeight()+'px'
						},'fast',function(){
							$(alerta).remove();
						});
					},time);
				}else{
					$(alerta).attr('data-alerta-sumir-no-proximo',1);
				}
			});
		}else{
			var alerta = $(document.createElement('div')).css('border-top-width','1px').addClass(''+CONFIG.alerta.padrao.classe+' '+(classe?classe:'')).text(mensagem).attr('data-ajax-loading','1').appendTo('body')[0];
			$(alerta).css('bottom','-'+$(alerta).outerHeight()+'px');
			$(alerta).animate({
				bottom: '0px'
			},'fast',function(){
				$('[data-alerta-sumir-no-proximo]').remove();
				if(time!='proximo'){
					setTimeout(function(){
						$(alerta).animate({
							bottom: '-'+$(alerta).outerHeight()+'px'
						},'fast',function(){
							$(alerta).remove();
						});
					},time);
				}else{
					$(alerta).attr('data-alerta-sumir-no-proximo',1);
				}	
			});
		}
	}else{
		if(!classe) classe = CONFIG.alerta.padrao.classe
		if(div_top){
			$('[data-ajax-carregando],[data-ajax-sucesso],[data-ajax-erro]',div_top).css(CONFIG.alerta_interno.invisivel);

			if(classe == CONFIG.alerta.padrao.classe){
				var div = div_top.find(div_carregando);
				div.css(CONFIG.alerta_interno.visivel);

				var div_mensagem = div;
				if(div.attr('data-ajax-carregando')) div_mensagem = $(div.attr('data-ajax-carregando'));
				div_mensagem.text(mensagem);
			}
			if(classe == CONFIG.alerta.sucesso.classe){
				var div = div_top.find(div_sucesso);
				div.css(CONFIG.alerta_interno.visivel);

				var div_mensagem = div;
				if(div.attr('data-ajax-sucesso')) div_mensagem = $(div.attr('data-ajax-sucesso'));
				div_mensagem.text(mensagem);
			}
			if(classe == CONFIG.alerta.erro.classe){
				var div = div_top.find(div_erro);
				div.css(CONFIG.alerta_interno.visivel);

				var div_mensagem = div;
				if(div.attr('data-ajax-erro')) div_mensagem = $(div.attr('data-ajax-erro'));
				div_mensagem.text(mensagem);
			}
		}else{
			if(div_carregando) div_carregando.css(CONFIG.alerta_interno.invisivel);
			if(div_sucesso) div_sucesso.css(CONFIG.alerta_interno.invisivel);
			if(div_erro) div_erro.css(CONFIG.alerta_interno.invisivel);

			if(classe == CONFIG.alerta.padrao.classe){
				var div = div_carregando;
				div.css(CONFIG.alerta_interno.visivel);

				var div_mensagem = div;
				if(div.attr('data-ajax-div-texto')) div_mensagem = $(div.attr('data-ajax-div-texto'));
				div_mensagem.text(mensagem);
			}
			if(classe == CONFIG.alerta.sucesso.classe){
				var div = div_sucesso;
				div.css(CONFIG.alerta_interno.visivel);

				var div_mensagem = div;
				if(div.attr('data-ajax-div-texto')) div_mensagem = $(div.attr('data-ajax-div-texto'));
				div_mensagem.text(mensagem);
			}
			if(classe == CONFIG.alerta.erro.classe){
				var div = div_erro;
				div.css(CONFIG.alerta_interno.visivel);

				var div_mensagem = div;
				if(div.attr('data-ajax-div-texto')) div_mensagem = $(div.attr('data-ajax-div-texto'));
				div_mensagem.text(mensagem);
			}
		}
	}
}


$(function() {
	$.fn.formToData = function(){
		var o = {};
		var a = this.serializeArray();

		a = a.concat(
			$('input[type=checkbox]:not(:checked)',this).map(function(){
				return {"name": this.name, "value": ''}
			}).get()
    	);

    	var radio_groups = {}
		$(":radio",this).each(function(){
		    radio_groups[this.name] = this.value;
		})

		for(group in radio_groups){
			var radio = $(":radio[name='"+group+"']:checked");
		    var if_checked = !!radio.length
		    var val = if_checked?radio.val():'';

		    a = a.concat( {name:group,value:val} );
		}

		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};

	$.event.special.destroyed = {
		remove:function(o){
			o.handler.apply(this,arguments);
		}
	}
});

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

var defineProp = function (obj, propName, value, writable) {
    try {
        Object.defineProperty(obj, propName, {
            enumerable: false,
            configurable: true,
            writable: writable,
            value: value
        });
    } catch(error) {
        obj[propName] = value;
    }
};

// json to formData 
// Object.toFormData(object /*{Object|Array}*/);
!function(a){"use strict";function b(a){return j.call(a).slice(8,-1)}function c(a){var b=l.call(a,function(a){return"["+a+"]"});return b[0]=a[0],b.join("")}function d(a){var d=new h,e=function(a,e,f,g){var h=b(e);switch(h){case"Array":break;case"Object":break;case"FileList":return k.call(e,function(a,b){var e=g.concat(b),f=c(e);d.append(f,a)}),!0;case"File":var i=c(g);return d.append(i,e),!0;case"Blob":var i=c(g);return d.append(i,e,e.name),!0;default:var i=c(g);return d.append(i,e),!0}};return Object.traverse(a,e,null,null,!0),d}var e=a.Blob,f=a.File,g=a.FileList,h=a.FormData,i=e&&f&&g&&h,j=Object.prototype.toString,k=Array.prototype.forEach,l=Array.prototype.map;i&&(Object.toFormData=d)}(window);
!function(a){"use strict";function b(a){return a instanceof Object}function c(a){return"number"==typeof a&&!h(a)}function d(a,c,d,e,f,h){var i=[[],0,g(a).sort(),a],j=[];do{var k=i.pop(),l=i.pop(),m=i.pop(),n=i.pop();for(j.push(k);l[0];){var o=l.shift(),p=k[o],q=n.concat(o),r=c.call(d,k,p,o,q,m);if(r!==!0){if(r===!1){i.length=0;break}if(!(m>=h)&&b(p)){if(-1!==j.indexOf(p)){if(f)continue;throw new Error("Circular reference")}if(!e){i.push(n,m,l,k),i.push(q,m+1,g(p).sort(),p);break}i.unshift(q,m+1,g(p).sort(),p)}}}}while(i[0]);return a}function e(a,b,e,g,h,i){var j=b,k=e,l=1===g,m=!!h,n=c(i)?i:f;return d(a,j,k,l,m,n)}var f=100,g=Object.keys,h=a.isNaN;Object.traverse=e}(window);

data_ajax();
if(CONFIG.sweetalert && typeof swal !== typeof function(){}){
	$.ajax({
	    url: CONFIG.sweetalert,
	    dataType: 'script',
	    cache: true,
	}).then(function(){
	    data_ajax();
	});
}
