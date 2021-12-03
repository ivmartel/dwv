'use strict';


const RegEx = {
    REGEXP_PATTERN_ORDER: 0,
    REGEXP_SET_ORDER: 1,

    /**
     * @param {RegExp} ptn
     * @param {string} str
     * @returns {Array}
     */
    match: (ptn, str) => {
        return str.match(ptn);
    },

    /**
     * @param {RegExp} ptn
     * @param {string} str
     * @param {number} [flag]
     * @returns {Array}
     */
    matchAll: (ptn, str, flag) => {
        flag = flag || RegEx.REGEXP_PATTERN_ORDER;
        let ret = [], rst;

        if (ptn.global) while ((rst = ptn.exec(str)) !== null) ret.push(rst);
        else if ((rst = str.match(ptn)) !== null) ret.push(rst);

        if (flag === RegEx.REGEXP_PATTERN_ORDER) {
            let ret2 = [], item = [];

            for (let i = 0; i < ret.length; i++) item.push(ret[i][0] + '');
            if (item.length > 0) ret2.push(item);

            for (let i = 0; i < ret.length; i++) {
                item = [];
                for (let j = 1; j < ret[i].length; j++) item.push(ret[i][j]);
                if (item.length > 0) ret2.push(item);
            }

            ret = ret2;
        }
        
        return ret;
    }
};


module.exports = RegEx;