// Simple ProseMirror Test Data
const proseMirrorJson = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Some test text",
        },
      ],
    },
  ],
};

// Encode data to test compatibility of library updates
// Generated binary Uint8Array by encoding the ProseMirror JSON
// const ydoc = TiptapTransformer.toYdoc(proseMirrorJson, "default")
// Result of Y.encodeStateAsUpdate(ydoc)
const proseMirrorYencodedStateUpdate = Uint8Array.from([
  1, 3, 152, 204, 171, 179, 4, 0, 7, 1, 7, 100, 101, 102, 97, 117, 108, 116, 3,
  9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 152, 204, 171, 179, 4, 0,
  6, 4, 0, 152, 204, 171, 179, 4, 1, 14, 83, 111, 109, 101, 32, 116, 101, 115,
  116, 32, 116, 101, 120, 116, 0,
]);

// Content of the state update
// Y.decodeUpdate(proseMirrorYencodedStateUpdate);
// {
//   structs: [
//     Item {
//       id: [ID],
//       length: 1,
//       origin: null,
//       left: null,
//       right: null,
//       rightOrigin: null,
//       parent: 'default',
//       parentSub: null,
//       redone: null,
//       content: [ContentType],
//       info: 2
//     },
//     Item {
//       id: [ID],
//       length: 1,
//       origin: null,
//       left: null,
//       right: null,
//       rightOrigin: null,
//       parent: [ID],
//       parentSub: null,
//       redone: null,
//       content: [ContentType],
//       info: 2
//     },
//     Item {
//       id: [ID],
//       length: 14,
//       origin: null,
//       left: null,
//       right: null,
//       rightOrigin: null,
//       parent: [ID],
//       parentSub: null,
//       redone: null,
//       content: ContentString { str: 'Some test text' },
//       info: 2
//     }
//   ],
//   ds: DeleteSet { clients: Map(0) {} }
// }

export { proseMirrorJson, proseMirrorYencodedStateUpdate };
