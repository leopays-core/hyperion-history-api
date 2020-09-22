const hyperionModule = {
    chain: "07032d693384fab3ca2e89436baeda5c2f8bf8638af2a2075666487b6e1f47d9",
    contract: 'lpc',
    action: 'newaccount',
    parser_version: ['1.8', '1.7'],
    handler: (action) => {
        // attach action extras here
        let name = null;
        const data = action['act']['data'];
        if (data['newact']) {
            name = data['newact'];
        } else if (data['name']) {
            name = data['name'];
            delete data['name'];
        }
        if (name) {
            action['@newaccount'] = {
                active: data['active'],
                owner: data['owner'],
                newact: name
            }
        }
    }
};

module.exports = { hyperionModule };
