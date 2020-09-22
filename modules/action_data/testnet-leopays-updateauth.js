const hyperionModule = {
    chain: "07032d693384fab3ca2e89436baeda5c2f8bf8638af2a2075666487b6e1f47d9",
    contract: 'lpc',
    action: 'updateauth',
    parser_version: ['1.8', '1.7'],
    handler: (action) => {
        // attach action extras here
        const data = action['act']['data'];
        const _auth = data['auth'];
        if (_auth['accounts'].length === 0) delete _auth['accounts'];
        if (_auth['keys'].length === 0) delete _auth['keys'];
        if (_auth['waits'].length === 0) delete _auth['waits'];
        action['@updateauth'] = {
            permission: data['permission'],
            parent: data['parent'],
            auth: _auth
        };
    }
};

module.exports = { hyperionModule };
