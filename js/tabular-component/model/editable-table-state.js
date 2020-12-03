class EditableTableState {
    _selectedId = undefined;
    _items = undefined;

    /**
     * @param selectedId
     * @returns {StateChanges}
     */
    switchSelectionTo(selectedId) {
        if (!this.selectionExists()) {
            // no previous selection
            this._selectedId = selectedId;
            return new StateChanges(undefined, this.selectionState);
        } else if (this.isIdSelected(selectedId)) {
            // current selection is not changed (is just again selected)
            return undefined;
        }
        // previous selection exists, new item is selected
        const prevTabularItemState = this.selectionState;
        const transientSelectionExists = this.transientSelectionExists();
        if (transientSelectionExists) {
            this.removeSelectedItem();
        }
        this._selectedId = selectedId;
        // can't select (aka make editable) a transient row because it doesn't exist
        // consequence: newIsCreated will never be true (from this method)
        return new StateChanges(prevTabularItemState, this.selectionState, transientSelectionExists);
    }

    /**
     * @param item
     * @returns {StateChanges}
     */
    clearSelectionAndUpdateItem(item) {
        const stateChanges = this.cancelSelection();
        this.replaceItem(item.id, item);
        stateChanges.newRowState = this.getStateOf(item.id);
        // when previous is a transient than the updated item appears as a creation (aka newIsCreated = true)
        stateChanges.newIsCreated = stateChanges.prevIsRemoved;
        return stateChanges;
    }

    /**
     * @returns {StateChanges}
     */
    createTransientSelection() {
        if (this.transientSelectionExists()) {
            // current (transient) selection is not changed
            return undefined;
        }
        // no transient selection exists
        const prevTabularItemState = this.selectionState;
        this._selectedId = this.insertNewItem().id;
        return new StateChanges(prevTabularItemState, this.selectionState, false, true);
    }

    /**
     * @returns {StateChanges}
     */
    cancelSelection() {
        return this.switchSelectionTo();
    }

    /**
     * "named processing" method type
     *
     * @param id
     * @returns {boolean}
     */
    isIdSelected(id) {
        return this._selectedId === id;
    }

    /**
     * @returns {boolean}
     */
    selectionExists() {
        return this._selectedId != null;
    }

    transientSelectionExists() {
        return EntityUtils.prototype.isTransientId(this._selectedId);
    }

    /**
     * private method
     */
    get selectionState() {
        if (!this.selectionExists()) {
            return undefined;
        }
        return new RowState(this._selectedId, this.selectedItem, true);
    }

    /**
     * private method
     */
    get selectedItem() {
        if (!this.selectionExists()) {
            return undefined;
        }
        return this._items[this._selectedId];
    }

    /**
     * private method
     */
    getStateOf(id) {
        if (!this._items || !this._items[id]) {
            return undefined;
        }
        return new RowState(id, this._items[id], this.isIdSelected(id));
    }

    /**
     * private method
     */
    replaceItem(id, item) {
        this._items[id] = item;
    }

    /**
     * private method
     */
    insertNewItem() {
        const NEW_ID = EntityUtils.prototype.NEW_ID;
        this._items[NEW_ID] = {id: NEW_ID};
        return this._items[NEW_ID];
    }

    /**
     * private method
     */
    removeSelectedItem() {
        delete this._items[this._selectedId];
    }

    /**
     * private method
     */
    set selectedId(selectedId) {
        throw `Unsupported operation! selectedId = ${selectedId}`;
    }

    /**
     * this plays also the role of an "initialization" method
     */
    set items(items) {
        this._items = {};
        this._selectedId = undefined;
        items.forEach(p => this._items[p.id] = p);
    }
}