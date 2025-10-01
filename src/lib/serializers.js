const serializeValue = (value) => {
  if (value === undefined || value === null) return value;

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).map(([key, val]) => [key, serializeValue(val)]);
    return Object.fromEntries(entries);
  }

  return value;
};

export const serializeDocument = (doc) => {
  if (!doc) return null;
  const data = typeof doc.data === "function" ? doc.data() : doc;
  if (!data) return null;
  const id = typeof doc.id === "string" ? doc.id : data.id;
  const base = serializeValue(data);
  return {
    ...(id ? { id } : {}),
    ...base,
  };
};

export const serializeCollection = (snapshot) => {
  if (!snapshot) return [];
  if (Array.isArray(snapshot)) {
    return snapshot.map((item) => serializeDocument(item));
  }
  if (typeof snapshot.docs === "object") {
    return snapshot.docs.map((doc) => serializeDocument(doc));
  }
  return [];
};
