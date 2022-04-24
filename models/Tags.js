const { Sequelize } = require("sequelize");

module.exports = (sequelize) => {
   const Tags = sequelize.define('tags', {
        user_id: {
            type: Sequelize.STRING,
            unique: true,
        },
        user_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        user_progression_stage: {
            type: Sequelize.INTEGER,
            defaultValue: 000,
            allowNull: false,
        },
        user_progression_history: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        user_completed_adventures: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
    return Tags;
};
   