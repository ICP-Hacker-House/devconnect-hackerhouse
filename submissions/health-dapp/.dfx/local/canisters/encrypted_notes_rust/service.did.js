export const idlFactory = ({ IDL }) => {
  const EncryptedNote = IDL.Record({
    'id' : IDL.Nat,
    'encrypted_text' : IDL.Text,
  });
  const anon_class_15_1 = IDL.Service({
    'add_note' : IDL.Func([IDL.Text], [], []),
    'app_vetkd_public_key' : IDL.Func(
        [IDL.Vec(IDL.Vec(IDL.Nat8))],
        [IDL.Text],
        [],
      ),
    'delete_note' : IDL.Func([IDL.Nat], [], []),
    'encrypted_symmetric_key_for_caller' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [IDL.Text],
        [],
      ),
    'get_notes' : IDL.Func([], [IDL.Vec(EncryptedNote)], []),
    'symmetric_key_verification_key' : IDL.Func([], [IDL.Text], []),
    'update_note' : IDL.Func([EncryptedNote], [], []),
    'whoami' : IDL.Func([], [IDL.Text], []),
  });
  return anon_class_15_1;
};
export const init = ({ IDL }) => { return []; };
