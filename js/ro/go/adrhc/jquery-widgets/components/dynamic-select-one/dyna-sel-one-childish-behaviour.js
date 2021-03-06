class DynaSelOneChildishBehaviour extends DefaultChildishBehaviour {
    /**
     * @param {AbstractComponent} parentComp
     * @param {string} childProperty is the parentState property where to save the selectedItem
     * @param {function(data: {}): IdentifiableEntity} [childEntityConverter]
     */
    constructor(parentComp, childProperty,
                childEntityConverter = (it) => it) {
        super(parentComp, childProperty);
        this.childEntityConverter = childEntityConverter;
    }

    /**
     * When having kids and useOwnerOnFields is null than the owner is used despite
     * useOwnerOnFields value otherwise the useOwnerOnFields value is considered.
     *
     * @param parentState
     * @param [useOwnerOnFields] {boolean}
     */
    copyChildState(parentState, useOwnerOnFields) {
        // selectedItem should already be a curated entity such that childEntityConverter would be useless
        const selectedItem = this._childComp.state.currentState.selectedItem;
        parentState[this.childProperty] = this.childEntityConverter(selectedItem);
    }

    /**
     * I assume that parentComp will already be set!
     *
     * this.parentComp must be {IdentifiableRowComponent}
     *
     * @param childComp {DynamicSelectOneComponent}
     */
    set childComp(childComp) {
        this._childComp = childComp;
        const parentState = this.parentComp.state.currentState;
        const dynaSelOneItem = this.extractChildState(parentState);
        childComp.dynaSelOneState.updateWithDynaSelOneItem(dynaSelOneItem);
    }
}