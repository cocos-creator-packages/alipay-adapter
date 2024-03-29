(function () {
    if (!(cc && cc.EditBox)) {
        return;
    }
    
    const EditBox = cc.EditBox;
    const js = cc.js;
    const KeyboardReturnType = EditBox.KeyboardReturnType;
    let _currentEditBoxImpl = null;

    function getKeyboardReturnType (type) {
        switch (type) {
            case KeyboardReturnType.DEFAULT:
            case KeyboardReturnType.DONE:
                return 'done';
            case KeyboardReturnType.SEND:
                return 'send';
            case KeyboardReturnType.SEARCH:
                return 'search';
            case KeyboardReturnType.GO:
                return 'go';
            case KeyboardReturnType.NEXT:
                return 'next';
        }
        return 'done';
    }

    function myEditBoxImpl () {
        this._delegate = null;
        this._editing = false;

        this._eventListeners = {
            onKeyboardInput: null,
            onKeyboardConfirm: null,
            onKeyboardComplete: null,
        };
    }

    js.extend(myEditBoxImpl, EditBox._ImplClass);
    EditBox._ImplClass = myEditBoxImpl;

    Object.assign(myEditBoxImpl.prototype, {
        init (delegate) {
            if (!delegate) {
                cc.error('EditBox init failed');
                return;
            }
            this._delegate = delegate;
        },
    
        setFocus (value) {
            if (value) {
                this.beginEditing();
            }
            else {
                this.endEditing();
            }
        },
    
        isFocused () {
            return this._editing;
        },
    
        beginEditing () {
            // In case multiply register events
            if (_currentEditBoxImpl === this) {
                return;
            }
            let delegate = this._delegate;
            // handle the old keyboard
            if (_currentEditBoxImpl) {
                let currentImplCbs = _currentEditBoxImpl._eventListeners;
                currentImplCbs.onKeyboardComplete();

                // https://developers.weixin.qq.com/minigame/dev/api/my.updateKeyboard.html
                my.updateKeyboard && my.updateKeyboard({
                    value: delegate._string,
                });
            }

            this._registerKeyboardEvent();
            this._showKeyboard();

            this._editing = true;
            _currentEditBoxImpl = this;
            delegate.editBoxEditingDidBegan();
        },
        
        endEditing () {
            this._hideKeyboard();
            let cbs = this._eventListeners;
            cbs.onKeyboardComplete && cbs.onKeyboardComplete();
        },

        _registerKeyboardEvent () {
            let self = this;
            let delegate = this._delegate;
            let cbs = this._eventListeners;

            cbs.onKeyboardInput = function (res) {        
                if (res.value.length > delegate.maxLength) {
                    res.value = res.value.slice(0, delegate.maxLength);
                }
                if (delegate._string !== res.value) {
                    delegate.editBoxTextChanged(res.value);
                }
            }

            cbs.onKeyboardConfirm = function (res) {
                delegate.editBoxEditingReturn();
                let cbs = self._eventListeners;
                cbs.onKeyboardComplete && cbs.onKeyboardComplete();
            }

            cbs.onKeyboardComplete = function () {
                self._editing = false;
                _currentEditBoxImpl = null;
                self._unregisterKeyboardEvent();
                delegate.editBoxEditingDidEnded();
            }

            my.onKeyboardInput(cbs.onKeyboardInput);
            my.onKeyboardConfirm(cbs.onKeyboardConfirm);
            my.onKeyboardComplete(cbs.onKeyboardComplete);
        },

        _unregisterKeyboardEvent () {
            let cbs = this._eventListeners;

            if (cbs.onKeyboardInput) {
                my.offKeyboardInput(cbs.onKeyboardInput);
                cbs.onKeyboardInput = null;
            }
            if (cbs.onKeyboardConfirm) {
                my.offKeyboardConfirm(cbs.onKeyboardConfirm);
                cbs.onKeyboardConfirm = null;
            }
            if (cbs.onKeyboardComplete) {
                my.offKeyboardComplete(cbs.onKeyboardComplete);
                cbs.onKeyboardComplete = null;
            }
        },

        _showKeyboard () {
            let delegate = this._delegate;
            let multiline = (delegate.inputMode === EditBox.InputMode.ANY);

            my.showKeyboard({
                defaultValue: delegate._string,
                maxLength: delegate.maxLength,
                multiple: multiline,
                confirmHold: false,
                confirmType: getKeyboardReturnType(delegate.returnType),
                success (res) {

                },
                fail (res) {
                    cc.warn(res.errMsg);
                }
            });
        },

        _hideKeyboard () {
            my.hideKeyboard({
                success (res) {
                    
                },
                fail (res) {
                    cc.warn(res.errMsg);
                },
            });
        },
    });
})();

