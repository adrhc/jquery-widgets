class ElasticListFactory {
    /**
     * @param items {IdentifiableEntity[]}
     * @param tableId {string}
     * @param bodyRowTmplId {string}
     * @param mustacheTableElemAdapter {MustacheTableElemAdapter}
     * @param repository {CrudRepository}
     * @param state {CrudListState}
     * @param view {SimpleListView}
     * @param simpleRow {SimpleRowComponent}
     * @return {ElasticListComponent}
     */
    create({
               items = [],
               tableId = "elasticSimpleList",
               bodyRowTmplId,
               mustacheTableElemAdapter = new MustacheTableElemAdapter(tableId, bodyRowTmplId),
               repository = new InMemoryCrudRepository(new EntityHelper(), items),
               state = new CrudListState(),
               view = new SimpleListView(mustacheTableElemAdapter),
               simpleRow = SimpleRowFactory.prototype
                   .createSimpleRow(tableId, {bodyRowTmplId})
           }) {
        return new ElasticListComponent(repository, state, view, simpleRow);
    }
}