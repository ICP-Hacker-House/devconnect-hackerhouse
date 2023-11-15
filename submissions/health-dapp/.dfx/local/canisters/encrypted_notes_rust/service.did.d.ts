import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface EncryptedNote { 'id' : bigint, 'encrypted_text' : string }
export interface anon_class_15_1 {
  'add_note' : ActorMethod<[string], undefined>,
  'app_vetkd_public_key' : ActorMethod<[Array<Uint8Array | number[]>], string>,
  'delete_note' : ActorMethod<[bigint], undefined>,
  'encrypted_symmetric_key_for_caller' : ActorMethod<
    [Uint8Array | number[]],
    string
  >,
  'get_notes' : ActorMethod<[], Array<EncryptedNote>>,
  'symmetric_key_verification_key' : ActorMethod<[], string>,
  'update_note' : ActorMethod<[EncryptedNote], undefined>,
  'whoami' : ActorMethod<[], string>,
}
export interface _SERVICE extends anon_class_15_1 {}
