/**
 * Role: orchestrate state, view and sub-components
 *
 * API:
 * - "data-id" on rows is mandatory and optionally on header rows
 * - "data-id" = "newItemBtn" on a header row or a button with the name "newItemBtn" would trigger onNewItem
 */
class TableEditorComponent {
    /**
     * @param editableTableView {TableEditorView}
     * @param tableElementAdapter {TableElementAdapter}
     * @param repository {TableEditorRepository}
     * @param rowEditorComponent {RowEditorComponent}
     * @param state {TableEditorState}
     */
    constructor(editableTableView, tableElementAdapter, repository,
                rowEditorComponent, state = new TableEditorState()) {
        this.editableTableView = editableTableView;
        this.tableElementAdapter = tableElementAdapter;
        this.repository = repository;
        this.state = state;
        this.rowEditorComponent = rowEditorComponent;
    }

    /**
     * new-item-creation event handler
     *
     * @param ev {Event}
     */
    onNewItem(ev) {
        const editableTable = ev.data;
        editableTable._switchToEdit(editableTable.state.createTransientSelection());
    }

    /**
     * (existing) item selection event handler
     *
     * @param ev {Event}
     */
    onSelectionSwitch(ev) {
        if ($(this).data("id") === "newItemBtn") {
            return false;
        }
        const editableTable = ev.data;
        const rowDataId = editableTable.editableTableView.rowDataIdOf(this);
        editableTable._switchToEdit(editableTable.state.switchSelectionTo(rowDataId));
    }

    /**
     * "cancel" (selection) event handler
     *
     * @param ev {Event}
     */
    onCancel(ev) {
        const editableTable = ev.data;
        const stateChange = editableTable.state.cancelSelection();
        editableTable._switchToReadOnly([stateChange]);
    }

    /**
     * "save" (selection) event handler
     *
     * @param ev {Event}
     */
    onSave(ev) {
        const editableTable = ev.data;
        editableTable._handleRepoError(editableTable._saveEditedEntity())
            .then((savedItem) => {
                console.log("TableEditorComponent.onSave\n", savedItem);
                const stateChanges = editableTable.state.cancelSelectionAndUpdateItem(savedItem);
                editableTable._switchToReadOnly(stateChanges);
            });
    }

    /**
     * @param stateChanges {Array<StateChange>}
     * @private
     */
    _switchToReadOnly(stateChanges) {
        this.rowEditorComponent.close();
        this.editableTableView.updateView(stateChanges);
    }

    /**
     * @param stateChanges {Promise<Array<StateChange>>}
     * @private
     */
    _switchToEdit(stateChanges) {
        stateChanges
            .then(stateChanges => {
                this.rowEditorComponent.close();
                return stateChanges;
            })
            .then(stateChanges => this.editableTableView.updateView(stateChanges))
            .then(() => {
                this.rowEditorComponent.init(this.state.selectedItem);
            });
    }

    /**
     * component initializer
     */
    init() {
        this._handleRepoError(this.repository.getAll())
            .then((items) => {
                console.log("TableEditorComponent items:\n", items);
                this.state.items = items;
                this.editableTableView.init({items: items});
            });
        this._configureEvents();
    }

    close() {
        this.tableElementAdapter.$table.off();
    }

    /**
     * (internal) errors handler
     *
     * @param promise
     * @return {Promise<any>}
     * @private
     */
    _handleRepoError(promise) {
        return promise.catch((jqXHR, textStatus, errorThrown) => {
            console.log(textStatus, errorThrown);
            alert(textStatus);
        });
    }

    /**
     * linking "outside" (and/or default) triggers to component's handlers (aka capabilities)
     * @private
     */
    _configureEvents() {
        // use $tbody to not mix with onNewItem
        this.tableElementAdapter.$table
            .on(this.eventsWithNamespace('dblclick'),
                `tr[data-owner='${this._tableId}'][data-id!='newItemBtn']
                [data-id!='${this.rowEditorComponent.buttonsRowDataId}']`, this, this.onSelectionSwitch)
            .on(this.eventsWithNamespace('click'),
                `[data-owner='${this._tableId}'][name='cancelBtn']`, this, this.onCancel)
            .on(this.eventsWithNamespace('click'), `[data-owner='${this._tableId}'][name='saveBtn']`, this, this.onSave)
            // dblclick on table header
            .on(this.eventsWithNamespace('dblclick'), `tr[data-owner='${this._tableId}'][data-id='newItemBtn']`, this, this.onNewItem)
            // click on newItemBtn <button name='newItemBtn'>
            .on(this.eventsWithNamespace('click'), `button[data-owner='${this._tableId}'][name='newItemBtn']`, this, this.onNewItem);
    }

    eventsWithNamespace(events) {
        if ($.isArray(events)) {
            return events.map(ev => `${ev}.table-editor-${this._tableId}`).join(" ");
        } else {
            return `${events}.table-editor-${this._tableId}`;
        }
    }

    get _tableId() {
        return this.tableElementAdapter.tableId;
    }

    /**
     * @return {undefined|*}
     * @private
     */
    get _editedEntityValues() {
        if (!this.state.selectionExists()) {
            return undefined;
        }
        return this.rowEditorComponent.entityValuesFor(this.state.selectedId);
    }

    /**
     * @return {Promise<IdentifiableEntity>}
     * @private
     */
    _saveEditedEntity() {
        return this.repository.save(this._editedEntityValues);
    }
}