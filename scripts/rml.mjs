// Shared RML builders for the generated Rive scenes (kkami-pet, kkami-walk).

/** A filled rectangle shape at (x, y). */
export const rect = (x, y, width, height, color) =>
  `<Shape x="${x}" y="${y}"><Rectangle width="${width}" height="${height}" originX="0" originY="0"/><Fill><SolidColor colorValue="FF${color}"/></Fill></Shape>`;

/** Rive draws its first child on top, so children are authored back to front. */
export const node = (name, id, shapes, attrs = "") =>
  `<Node name="${name}" id="0:${id}" ${attrs}>${shapes.toReversed().join("\n")}</Node>`;

/** Keyframes for one object: { property: [[frame, value], ...] }. */
export const keys = (id, properties, interpolation = "hold") =>
  `<KeyedObject objectId="0:${id}">${Object.entries(properties)
    .map(
      ([property, frames]) =>
        `<KeyedProperty property="${property}">${frames.map(([frame, value]) => `<KeyFrameDouble frame="${frame}" value="${value}" interpolationType="${interpolation}"/>`).join("")}</KeyedProperty>`,
    )
    .join("")}</KeyedObject>`;
