function validate_fields(list) {
    // the list must contain objects that look like this:
    var example = {
        type: "", // with parameters included
        constraints: [
            "" // with parameters included (separated by a space)
        ]
    }
    const validTypes = [
        "INT",
        "INTEGER",
        "TINYINT",
        "SMALLINT",
        "MEDIUMINT",
        "BIGINT",
        "INT2",
        "INT8",
        "DECIMAL", // has 2 parameters (total digits, digits right of the decimal point)
        "REAL",
        "DOUBLE",
        "FLOAT",
        "NUMERIC",
        "CHARACTER", // 1 parameter (length)
        "VARCHAR", // 1 parameter (length)
        "NCHAR", // 1 parameter (length)
        "NVARCHAR", // 1 parameter (length)
        "TEXT",
        "BOOLEAN",
        "DATE",
        "DATETIME"
    ]

    const validParameters = [
        {
            type: "DECIMAL",
            parameters: 2
        },
        {
            type: "CHARACTER",
            parameters: 1
        },
        {
            type: "VARCHAR",
            parameters: 1
        },
        {
            type: "NCHAR",
            parameters: 1
        },
        {
            type: "NVARCHAR",
            parameters: 1
        },
    ]
    
    const validConstraints = [
        "NOT NULL",
        "UNIQUE",
        "PRIMARY KEY",
        "FOREIGN KEY",
        "CHECK", // needs parameter
        "DEFAULT" // needs parameter
    ]

    // validation process
    for (var field of list) {
        var type = field.type.toUpperCase();
        // does it contain a parameter?
        if (type.includes("(") && type.includes(")")) {
            var split1 = type.split("(");
            type = split1[0];
            // how many parameters are there meant to be
            var paras = 0;
            for (var para of validParameters) {
                if (type == para.type) {
                    paras = para.parameters;
                }
            }
            if (paras == 0) throw "V03"; // Date type has parameters when it shouldn't
            if (paras == 1) {
                if (split1.length == 2) {
                    var isNotNumber = isNaN(split1[1].replace(")", ""));
                    if (isNotNumber) {
                        throw "V04"; // Invlid parameter or parameter length
                    }
                } else {
                    throw "V02"; // Invalid parameter format (CHANGE TO SERVER ERROR IF FRONTEND HAS OWN FORMAT)
                }
            }
            if (paras == 2) {
                if (split1.length == 2) {
                    var split2 = split1[1].replace(")", "").replaceAll(" ", "").split(",")
                    if (split2.length != 2) throw "V04"; // Invlid parameter or parameter length
                    if (isNaN(split2[0])) throw "V04";
                    if (isNaN(split2[1])) throw "V04";
                } else {
                    throw "V02"; // Invalid parameter format (CHANGE TO SERVER ERROR IF FRONTEND HAS OWN FORMAT)
                }
            }
        }
        if (! validTypes.includes(type)) {
            throw "V05"; // Invlaid data type
        }

        for (var constr of field.constraints) {
            constr = constr.toUpperCase();
            if (! validConstraints.includes(constr)) {
                // TODO:
                // DOES IT HAVE PARAMETERS???
                // if not:
                throw "VO6"; // Invalid constraint
            }
        }
    }
}