class CreateDeleteListFactory {
    /**
     * @param tableIdOrJQuery {string|jQuery<HTMLTableElement>}
     * @param items {IdentifiableEntity[]}
     * @param repository {CrudRepository}
     * @param crudListState {CrudListState}
     * @param bodyRowTmplId {string}
     * @param mustacheTableElemAdapter {MustacheTableElemAdapter}
     * @param simpleListView {SimpleListView}
     * @param addNewRowsAtEnd {boolean} whether to append or prepend
     * @param bodyRowTmplHtml {string}
     * @param rowChildCompFactories {ChildComponentFactory|ChildComponentFactory[]} are components placed on a row
     * @param rowChildishBehaviourFactoryFn
     * @param idRowCompFactoryFn {function(identifiableEntity: IdentifiableEntity, afterItemId: number|string, elasticListComponent: ElasticListComponent): IdentifiableRowComponent}
     * @param childishBehaviour {ChildishBehaviour} permit CreateDeleteListComponent to update its parent
     * @return {ElasticListComponent}
     */
    static create(tableIdOrJQuery, {
        items = [],
        repository = new InMemoryCrudRepository(items),
        addNewRowsAtEnd,
        crudListState = new CrudListState(addNewRowsAtEnd),
        bodyRowTmplId,
        bodyRowTmplHtml,
        mustacheTableElemAdapter = new MustacheTableElemAdapter(tableIdOrJQuery, bodyRowTmplId, bodyRowTmplHtml),
        simpleListView = new SimpleListView(mustacheTableElemAdapter),
        rowChildCompFactories,
        rowChildishBehaviourFactoryFn = (parentComp) => new DefaultChildishBehaviour(parentComp),
        idRowCompFactoryFn = (item, afterItemId, elasticListComponent) => {
            const idRowComp = SimpleRowFactory.createIdentifiableRow({
                mustacheTableElemAdapter: elasticListComponent.tableBasedView.tableAdapter,
                childCompFactories: rowChildCompFactories,
                tableRelativePositionOnCreate: addNewRowsAtEnd ? "append" : "prepend"
            });
            const rowChildishBehaviour = rowChildishBehaviourFactoryFn(elasticListComponent);
            if (rowChildishBehaviour) {
                idRowComp.childishBehaviour = rowChildishBehaviour;
            }
            idRowComp.simpleRowState.update(item, "CREATE", afterItemId);
            return idRowComp;
        },
        childishBehaviour
    }) {
        const createDeleteList = new CreateDeleteListComponent(repository, crudListState, simpleListView, idRowCompFactoryFn);
        if (childishBehaviour) {
            createDeleteList.childishBehaviour = childishBehaviour;
        }
        return createDeleteList;
    }
}