if (Modernizr.template) {
    $.ajaxSetup({
        contentType: 'application/json',
        processData: false
    });
    $.ajaxPrefilter(function (options) {
        if (options.contentType === 'application/json' && options.data) {
            options.data = JSON.stringify(options.data);
        }
    });
    $(() => {
        const dogs = [{id: 1, name: "dog1"}, {id: 2, name: "dog2"}, {id: 3, name: "dog3"}];

        // dogs table with editable row
        const dogsTableWithEdit = "dogsTableWithEdit";
        SimpleListFactory.create({items: dogs, tableIdOrJQuery: dogsTableWithEdit})
            .init()
            .then(updateAllStateChanges => {
                const items = updateAllStateChanges[0].data;
                const editableRow = SimpleRowFactory.createIdentifiableRow({
                    tableIdOrJQuery: dogsTableWithEdit,
                    rowTmpl: "dogsTableWithEditSelectedRowTmpl",
                    tableRelativePositionOnCreate: "prepend"
                });
                editableRow
                    // switch to existing row (aka enter "edit" mode)
                    .update(items[0])
                    // extracting row data for e.g. save
                    .then(() => {
                        const extractedEntity = editableRow.extractEntity();
                        console.log("1. extractedEntity:\n", JSON.stringify(extractedEntity));
                    })
                    // switch to new row (aka ADD then enter "edit" mode)
                    .then(() => editableRow
                        .update({id: EntityUtils.transientId, name: "new dog (after id 3)"},
                            "CREATE", 3))
                    .then(() => editableRow
                        .update({
                                id: 999,
                                name: `new dog (using view's default positioning: ${editableRow.simpleRowView.tableRelativePositionOnCreate})`
                            },
                            "CREATE"))
                    .then(() => {
                        const extractedEntity = editableRow.extractEntity();
                        console.log("2. extractedEntity:\n", JSON.stringify(extractedEntity));
                    })
            });

        // dogs table with deleted row
        const dogsTableWithDelete = "dogsTableWithDelete";
        SimpleListFactory.create({
            items: dogs,
            tableIdOrJQuery: dogsTableWithDelete,
            bodyRowTmplId: "dogsTableWithDeleteReadOnlyRowTmpl"
        })
            .init()
            .then(updateAllStateChanges => {
                const items = updateAllStateChanges[0].data;
                const simpleRow = SimpleRowFactory.createSimpleRow(
                    {
                        tableIdOrJQuery: dogsTableWithDelete,
                        rowTmpl: "dogsTableWithDeleteDeletedRowTmpl"
                    });
                // switching to "simpleRow" display type (i.e. line-through text style)
                simpleRow.update(items[0])
                    // removing the row
                    .then(() => simpleRow.update(items[1], "DELETE"));
            });
    })
} else {
    // Find another way to add the rows to the table because
    // the HTML template element is not supported.
}