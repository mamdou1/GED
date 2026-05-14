// services/MetaFieldOverrideService.js
const { MetaField, MetaFieldOverride } = require('../models');

class MetaFieldOverrideService {
  
  async getMetaFieldsWithOverrides(typeDocumentId, entityType, entityId) {
    const baseMetaFields = await MetaField.findAll({
      where: { type_document_id: typeDocumentId },
      order: [['position', 'ASC']]
    });
    
    if (!baseMetaFields.length) return [];
    
    const overrides = await MetaFieldOverride.findAll({
      where: {
        type_document_id: typeDocumentId,
        entity_type: entityType,
        entity_id: entityId
      }
    });
    
    const overrideMap = new Map();
    overrides.forEach(override => {
      overrideMap.set(override.meta_field_id, override);
    });
    
    const result = [];
    
    for (const field of baseMetaFields) {
      const override = overrideMap.get(field.id);
      
      // Si le champ est masqué, on ne l'ajoute pas
      if (override && override.hidden === true) {
        continue;
      }
      
      let finalField = {
        id: field.id,
        name: field.name,
        field_type: field.field_type,
        label: override?.label_override || field.label,
        required: override?.required_override !== null ? override.required_override : field.required,
        position: override?.position_override !== null ? override.position_override : field.position,
        options: override?.options_override || field.options,
        placeholder: override?.placeholder_override || field.placeholder,
        description: override?.description_override || field.description,
        defaultValue: override?.default_value_override || field.default_value,
        source: 'base',
        isOverridden: !!override,
        hidden: false
      };
      
      if (override) {
        finalField.original = {
          label: field.label,
          required: field.required,
          position: field.position
        };
      }
      
      result.push(finalField);
    }
    
    result.sort((a, b) => a.position - b.position);
    return result;
  }
  
  async setOverride(typeDocumentId, metaFieldId, entityType, entityId, overrideData) {
    const [override, created] = await MetaFieldOverride.findOrCreate({
      where: {
        type_document_id: typeDocumentId,
        meta_field_id: metaFieldId,
        entity_type: entityType,
        entity_id: entityId
      },
      defaults: {
        type_document_id: typeDocumentId,
        meta_field_id: metaFieldId,
        entity_type: entityType,
        entity_id: entityId,
        ...overrideData
      }
    });
    
    if (!created) {
      await override.update(overrideData);
    }
    
    return override;
  }
  
  async removeOverride(typeDocumentId, metaFieldId, entityType, entityId) {
    return await MetaFieldOverride.destroy({
      where: {
        type_document_id: typeDocumentId,
        meta_field_id: metaFieldId,
        entity_type: entityType,
        entity_id: entityId
      }
    });
  }
  
  async removeAllOverrides(typeDocumentId, entityType, entityId) {
    return await MetaFieldOverride.destroy({
      where: {
        type_document_id: typeDocumentId,
        entity_type: entityType,
        entity_id: entityId
      }
    });
  }
  
  async hasOverrides(typeDocumentId, entityType, entityId) {
    const count = await MetaFieldOverride.count({
      where: {
        type_document_id: typeDocumentId,
        entity_type: entityType,
        entity_id: entityId
      }
    });
    return count > 0;
  }
  
  async cloneOverrides(sourceType, sourceId, targetType, targetId, typeDocumentId = null) {
    const whereClause = {
      entity_type: sourceType,
      entity_id: sourceId
    };
    
    if (typeDocumentId) {
      whereClause.type_document_id = typeDocumentId;
    }
    
    const sourceOverrides = await MetaFieldOverride.findAll({
      where: whereClause
    });
    
    const newOverrides = sourceOverrides.map(override => ({
      type_document_id: override.type_document_id,
      meta_field_id: override.meta_field_id,
      entity_type: targetType,
      entity_id: targetId,
      label_override: override.label_override,
      required_override: override.required_override,
      hidden: override.hidden,
      position_override: override.position_override,
      options_override: override.options_override,
      default_value_override: override.default_value_override,
      placeholder_override: override.placeholder_override,
      description_override: override.description_override,
      validation_rules_override: override.validation_rules_override
    }));
    
    return await MetaFieldOverride.bulkCreate(newOverrides);
  }
}

module.exports = new MetaFieldOverrideService();