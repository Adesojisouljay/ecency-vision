import React from "react";

import Comment from "./index";

import {UiInstance} from "../../helper/test-helper";

import renderer from "react-test-renderer";

const defProps = {
    defText: '',
    submitText: 'Reply',
    users: [],
    activeUser: null,
    ui: UiInstance,
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    onSubmit: () => {

    },
    toggleUIProp: () => {

    }
};

it("(1) Default render", () => {
    const props = {...defProps};

    const component = renderer.create(<Comment {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});


it("(2) Cancellable, in progress", () => {
    const props = {...{inProgress: true, cancellable: true, defText: 'foo'}, ...defProps};

    const component = renderer.create(<Comment {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});

