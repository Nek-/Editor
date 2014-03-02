/**
 * This file is a part of nekland editor package
 *
 * (c) Nekland <nekland.fr@gmail.fr>
 *
 * For the full license, take a look to the LICENSE file
 * on the root directory of this project
 */

(function() {
    var imageModule = function(translator) {
        this.translator = translator;
        this.options    = {
            path:          'upload.php',
            inputName:     'image',
            method:        'POST', // For compatibility, but should be PUT
            dataName:      'url',
            dataErrorName: 'error'
        };
    };

    /**
     * Class that is able to setup a resize-layer upon a jQuery image object
     * and handle all the resize process automatically
     */
    var ImageResizer = function($img) {
        // Notice: the classes in the templates are usefull to the good
        // code execution, see the mousedown event on nekland-resize
        var resizeTemplate = 
            '<span id="nekland-resize"><img src="'+$img.attr('src')+'" /><span class="resize-layout">'
            + '<span class="resize-top"></span>'
            + '<span class="resize-bottom"></span>'
            + '<span class="resize-left"></span>'
            + '<span class="resize-right"></span>'
            + '<span class="resize-top-left"></span>'
            + '<span class="resize-top-right"></span>'
            + '<span class="resize-bottom-left"></span>'
            + '<span class="resize-bottom-right"></span>'
            + '</span></span>',
            $body = $('body');
        var active     = false,
            position   = $img.position(),
            dim        = {
                width:  $img.width(),
                height: $img.height()
            },
            directions = {
                height: null,
                width: null
            },
            originalSize = $.extend({}, dim);
        
        this.activateImageResize = function () {

            // Initialization of the resizer
            $img.after(resizeTemplate);
            $neklandResize = $('#nekland-resize');
            $neklandResize.css(dim);
            $img.hide();


            // Events definition
            function onMoveAction(e) {
                if (active) {
                    var $this = $(this),
                        dims  = $.extend({}, originalSize);

                    if (directions.right) {
                        dims.width = e.pageX - position.left;
                    } else if (directions.left) {
                        dims.width = (position.left - e.pageX) + dims.width;
                    }

                    if (directions.top) {
                        dims.height = position.top - e.pageY + dims.height;
                    } else if (directions.bottom) {
                        dims.height = e.pageY - position.top;
                    }

                    if ((directions.top && (directions.left || directions.right)) || (directions.bottom && (directions.left || directions.right))) {
                        // We should make something a bit more beatiful using the ratio
                        var ratioA = originalSize.width / originalSize.height,
                            ratioB = dims.width / dims.height;

                        if (ratioA !== ratioB) {
                            dims.width = (dims.height/originalSize.height) * originalSize.width;
                        }
                    }

                    $neklandResize.css({
                        width: dims.width,
                        height: dims.height
                    });
                }
            }
            function awesomeMouseUp() {
                var $this = $(this);
                active = false;
                $('body').unbind('mousemove', onMoveAction);

                originalSize = {
                    width: $this.width(),
                    height: $this.height()
                };
            }
            function terminateResizer() {
                $img.css({
                    width:  $neklandResize.width(),
                    height: $neklandResize.height()
                });
                $neklandResize.remove();
                $img.show();
                $body.unbind('mouseup', awesomeMouseUp);
                $body.unbind('click', terminateResizer);
            }

            $neklandResize.mousedown(function(e) {
                // enable the drag
                var $target = $(e.target);

                switch ($target.attr('class')) {
                    case 'resize-top':
                        directions.top = true;
                        break;
                    case 'resize-bottom':
                        directions.bottom = true;
                        break;
                    case 'resize-right':
                        directions.right = true;
                        break;
                    case 'resize-left':
                        directions.left = true;
                        break;

                    case 'resize-top-left':
                        directions.top  = true;
                        directions.left = true;
                        break;
                    case 'resize-top-right':
                        directions.top   = true;
                        directions.right = true;
                        break;
                    case 'resize-bottom-left':
                        directions.bottom = true;
                        directions.left   = true;
                        break;
                    case 'resize-bottom-right':
                        directions.bottom = true;
                        directions.right  = true;
                        break;
                }

                $body.bind('mousemove', onMoveAction);
                active = true;

                return false;
            });

            $body.bind('mouseup', awesomeMouseUp);
            $body.click(terminateResizer);

        }

        $img.click(this.activateImageResize);
    };

    imageModule.prototype.getTemplateBefore = function () {
        var tpl =  '<a class="btn btn-default" id="image_button" href="javascript:;">' +
            this.translator.translate('image', {
                ucfirst: true
            }) + '</a>';

        return tpl;
    };

    // TODO: add simple form for image via url
    imageModule.prototype.getTemplateAfter = function () {

        // Header of the modal
        var tpl = '<div class="modal fade" id="image-modal" role="dialog" aria-hidden="true">';
        tpl += '<div class="modal-dialog"><div class="modal-content"><div class="modal-header">';
        tpl += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
        tpl += '<h3>' + this.translator.translate('addImage', {ucfirst: true}) + '</h3>';
        tpl += '</div>';

        // Content of the modal
        tpl += '<div class="modal-body"><div class="row"><div class="col-md-10">';
        tpl += '<label for="image-input">' + this.translator.translate('yourImage', {ucfirst: true}) + '</label>';
        tpl += '<input type="file" class="" name="' + this.options.inputName + '" id="image-input" />';
        tpl += '<p class="error"></p>';
        tpl += '</div></div>';

        // Progress bar
        tpl += '<div class="row"><div class="col-md-10">';
        tpl += '<div class="progress">';
        tpl += '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0">';
        tpl += '</div></div>';
        tpl += '</div></div></div>';

        // Bottom of the modal
        tpl += '<div class="modal-footer">';
        tpl += '<button type="button" class="btn" data-dismiss="modal" aria-hidden="true">';
        tpl += this.translator.translate('close', {ucfirst: true}) + '</button>';
        tpl += '<button type="button" class="btn btn-primary nekland-editor-command" data-editor-command="uploadImage" data-editor-module="image">';
        tpl += this.translator.translate('insertImage', {ucfirst: true}) + '</button>';

        return tpl += '</div></div></div></div>';
    };

    /**
     * Add the event for open the modal
     *
     */
    imageModule.prototype.addEvents        = function (module) {
        var self = this;
        $('#image_button').click(function () {
            self.saveSelection();
            $('#image-modal').modal('show');
        });
    };

    /**
     * Upload an image !
     */
    imageModule.prototype.execute          = function ($button, module) {
        var command      = $button.data('editor-command'),
            $modal       = $('#image-modal'),
            $progressbar = $modal.find('.progress-bar'),
            self         = this;

        var xhr = new XMLHttpRequest();
        xhr.open(module.getOption('method'), module.getOption('path'));

        xhr.upload.onprogress = function(e) {
            $progressbar.css('width', (e.total / e.loaded) + '%');
        };

        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4) {
                data = JSON.parse(xhr.responseText);

                if (xhr.status == 200) {
                    $modal.modal('hide');
                    
                    // Creating the image element
                    var imageElement = document.createElement('img');                    
                    imageElement.setAttribute('src', data[module.getOption('dataName')]);
                    imageElement.setAttribute('alt', 'an image');

                    // Inserting the image in the container
                    var range = window.getSelection().getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(imageElement);

                    var $image = $(imageElement);
                    $image.data('resizer', new ImageResizer($image));

                } else {
                    $modal.find('.error').html(data[module.getOption('dataErrorName')]);
                }
            }
        };


        var form = new FormData();
        form.append(module.getOption('inputName'), $modal.find('#image-input').get(0).files[0]);

        xhr.send(form);

        return true;
    };

    imageModule.prototype.getName          = function () { return 'image'; };
    imageModule.prototype.getOption        = function (option) { return this.options[option]; };
    imageModule.prototype.setOptions       = function (_options) {
        if (_options !== undefined) {
            this.options = $.extends({}, this.options, _options);
        }
    };

    window.nekland.Editor.modules.push(imageModule);
})();