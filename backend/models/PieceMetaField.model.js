// models/PieceMetaField.js
module.exports = (sequelize, DataTypes) => {
  const PieceMetaField = sequelize.define(
    "PieceMetaField",
    {
      piece_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      field_type: {
        type: DataTypes.ENUM("text", "date", "file", "number"),
        allowNull: false,
      },
      required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      position: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      extraction_keywords: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      extraction_pattern: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "piece_meta_fields",
      timestamps: true,
      underscored: true,
    },
  );

  PieceMetaField.associate = (models) => {
    PieceMetaField.belongsTo(models.Pieces, {
      foreignKey: "piece_id",
      as: "piece",
    });

    PieceMetaField.hasMany(models.PieceValue, {
      foreignKey: "piece_meta_field_id",
      as: "values",
    });
  };

  return PieceMetaField;
};
