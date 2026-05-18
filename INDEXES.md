# Database Indexes

Total: **97 indexes** across **33 tables** — added across migration history.

Legend: **U** = Unique · **P** = Partial · **C** = Composite · **UP** = Unique + Partial · **UC** = Unique + Composite

---

## admin_permissions
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `admin_permissions_key_key` | `key` | U | 1773100000002 |

## admin_role_permissions
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `admin_role_permissions_role_id_permission_id_key` | `role_id, permission_id` | UC | 1773100000001 |

## admin_roles
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `admin_roles_name_key` | `name` | U | 1737000000050 |

## admin_user_roles
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `admin_user_roles_admin_user_id_role_id_key` | `admin_user_id, role_id` | UC | 1737000000051 |
| `idx_admin_user_roles_deleted_at` | `deleted_at` | — | 1773049874030 |

## admin_users
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `admin_users_email_key` | `email` | U | 1737000000049 |
| `admin_users_phone_key` | `phone` | U | 1737000000049 |
| `idx_admin_users_user_entity_type` | `user_entity_type` | — | 1737000000060 |
| `idx_admin_users_active_status` | `status` WHERE `deleted_at IS NULL` | P | 1773600000059 |
| `idx_admin_users_deleted_at` | `deleted_at` | — | 1773600000059 |
| `admin_users_email_active_idx` | `email` WHERE `deleted_at IS NULL` | P | 1778975444588 |

> `admin_users_email_active_idx` is the login hot-path index. The full unique index enforces
> uniqueness; the partial index gives the planner a tighter match for `WHERE email = $1 AND deleted_at IS NULL`.

## auth_identity
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_auth_identity_provider_lookup` | `provider, provider_user_id` | UC | 1737000000040 |
| `idx_auth_identity_customer_id` | `customer_id` | — | 1737000000040 |

## chat_entities
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_chat_entities_chat_id` | `chat_id` | — | 1737000000042 |
| `idx_chat_entities_entity` | `entity_type, entity_id` | C | 1737000000042 |
| `idx_chat_entities_unique` | `chat_id, entity_type, entity_id` | UC | 1737000000042 |

## chat_message_media
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_chat_message_media_message_id` | `message_id` | — | 1737000000045 |
| `idx_chat_message_media_type` | `media_type` | — | 1737000000045 |

> `chat_id` index was added in migration 1773600000007 and removed in 1773600000009.

## chat_message_receipts
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_chat_message_receipts_message_id` | `message_id` | — | 1737000000046 |
| `idx_chat_message_receipts_participant_id` | `participant_id` | — | 1737000000046 |
| `idx_chat_message_receipts_unique` | `message_id, participant_id, status` | UC | 1737000000046 |

## chat_messages
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_chat_messages_chat_id` | `chat_id` | — | 1737000000044 |
| `idx_chat_messages_sender` | `sender_id, sender_type` | C | 1737000000044 |
| `idx_chat_messages_created_at` | `created_at` | — | 1737000000044 |
| `idx_chat_messages_reply_to` | `reply_to_message_id` WHERE `reply_to_message_id IS NOT NULL` | P | 1737000000044 |
| `idx_chat_messages_chat_id_created_at` | `chat_id, created_at` | C | 1737000000044 |

> `(chat_id, client_msg_id)` index was added in 1737000000044 and removed in 1737000000064.

## chat_participants
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_chat_participants_chat_id` | `chat_id` | — | 1737000000043 |
| `idx_chat_participants_status` | `status` | — | 1737000000043 |
| `idx_chat_participants_muted` | `muted_until` WHERE `muted_until IS NOT NULL` | P | 1737000000043 |
| `idx_chat_participants_unique_user` | `chat_id, user_id, user_entity_type` | UC | 1737000000043 / 1737000000063 |
| `idx_chat_participants_inbox` | `user_id, user_entity_type, status, is_pinned` | C | 1737000000043 / 1737000000063 |
| `idx_chat_participants_user` | `user_id, user_entity_type` | C | 1737000000063 |

> Migration 1737000000063 renamed `user_type` → `user_entity_type` and rebuilt the affected indexes.

## chat_user_inbox_state
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_chat_user_inbox_state_unique` | `user_id, user_type` | UC | 1737000000047 |

## chats
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_chats_reference_id` | `reference_id` | — | 1737000000041 |
| `idx_chats_chat_type` | `chat_type` | — | 1737000000041 |
| `idx_chats_status` | `status` | — | 1737000000041 |
| `idx_chats_topic` | `topic_type, topic_id` | C | 1737000000041 |
| `idx_chats_initiator` | `initiator_type, initiator_id` | C | 1737000000041 |
| `idx_chats_last_message_at` | `last_message_at` | — | 1737000000041 |
| `idx_chats_expires_at` | `expires_at` WHERE `expires_at IS NOT NULL` | P | 1737000000041 |
| `idx_chats_deterministic_lookup` | `chat_type, topic_type, topic_id, status` | C | 1737000000041 |

## customer
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_customer_deleted_at` | `deleted_at` | — | 1773600000003 |
| `idx_customer_user_entity_type` | `user_entity_type` | — | 1737000000059 |

> `idx_customer_user_entity_id` was added in 1737000000058 and replaced by `idx_customer_user_entity_type` in 1737000000059.

## customer_address
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_customer_address_customer_id` | `customer_id` | — | 1737000000053 |

## customer_badge
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_customer_badge_customer_id` | `customer_id` | — | 1737000000039 |
| `idx_customer_badge_badge_code` | `badge_code` | — | 1737000000039 |

## customer_favorite
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_customer_favorite_lookup` | `customer_id, favorite_type, target_id` | C | 1737000000017 |

## customer_preference
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `ux_customer_preference_unique` | `customer_id, pref_key, pref_value` | UC | 1737000000037 |

## delivery_company_users
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_delivery_company_users_company` | `delivery_company_id` | — | 1773800000001 |

## dish_categories
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `dish_categories_name_key` | `name` | U | 1773600000028 |

## dish_cuisine_map
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `dish_cuisine_map_dish_id_cuisine_id_key` | `dish_id, cuisine_id` | UC | 1773600000036 |

## dish_cuisines
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `dish_cuisines_name_key` | `name` | U | 1773600000035 |

## dish_dietary_flags
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `dish_dietary_flags_name_key` | `name` | U | 1773600000035 |

## dish_dietary_map
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `dish_dietary_map_dish_id_dietary_id_key` | `dish_id, dietary_id` | UC | 1773600000036 |

## dish_media
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_dish_media_dish_id` | `dish_id` | — | 1773600000070 |

## dish_special_events
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `dish_special_events_dish_id_unique` | `dish_id` | U | 1773600000041 |

## dish_tag_map
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `dish_tag_map_dish_id_tag_id_key` | `dish_id, tag_id` | UC | 1773600000036 |

## dish_tags
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `dish_tags_name_key` | `name` | U | 1773600000035 |

## dish_variants
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_dish_variants_dish_id_id_not_deleted` | `dish_id ASC, id ASC` WHERE `deleted_at IS NULL` | CP | 1773600000040 |
| `uniq_dish_variant_title_idx` | `dish_id ASC, lower(title) ASC` | UC | 1773600000040 |

## dish_variants_staging
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_dish_variants_staging_dish_id_not_deleted` | `dish_staging_id ASC, id ASC` WHERE `deleted_at IS NULL` | CP | 1773600000040 |
| `uniq_dish_variant_staging_title_idx` | `dish_staging_id ASC, lower(title) ASC` | UC | 1773600000040 |

## dishes / dishes_staging
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_dishes_kitchen_id` | `kitchen_id` | — | 1773600000030 |
| `idx_dishes_staging_dishid_createdat_not_deleted` | `dish_id ASC, created_at DESC` WHERE `deleted_at IS NULL` | CP | 1773600000031 |

## event_log
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_event_log_event_code` | `event_code` | — | 1737000000048 |
| `idx_event_log_status` | `status` | — | 1737000000048 |
| `idx_event_log_created_at` | `created_at` | — | 1737000000048 |

## kitchen_users
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `kitchen_users_phone_idx` | `phone` | — | 1737000000003 |
| `kitchen_users_status_idx` | `status` | — | 1737000000003 |
| `idx_kitchen_users_user_entity_type` | `user_entity_type` | — | 1737000000060 |

## kitchens
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_kitchens_created_at` | `created_at DESC` | — | 1773600000058 |
| `idx_kitchens_active_created_at` | `created_at DESC` WHERE `deleted_at IS NULL` | P | 1773600000058 |

## kitchens_staging
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `kitchens_staging_kitchen_id_idx` | `kitchen_id` | U | 1737000000002 |

## menu_dishes
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_menu_dishes_menu_id` | `menu_id` | — | 1773600000032 |
| `idx_menu_dishes_menu_display_order` | `menu_id, display_order` | C | 1773600000032 |

## menus
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_menus_kitchen_id` | `kitchen_id` | — | 1773600000027 |

## otp_requests
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_otp_identity_type_created` | `identity ASC, otp_type ASC, created_at DESC` | C | 1737000000034 / 1737000000052 |

## refresh_tokens
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_refresh_tokens_user_id` | `user_id` | — | 1773049874029 |
| `idx_refresh_tokens_token_hash` | `token_hash` | — | 1773049874029 |
| `idx_refresh_tokens_user_id_token_hash` | `user_id, token_hash` | C | 1773049874029 |
| `idx_refresh_tokens_expires_at` | `expires_at` | — | 1773049874029 |

## rider_auth
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_rider_auth_rider_id` | `rider_id` | — | 1773800000001 |

## rider_documents
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_rider_documents_rider` | `rider_id` | — | 1773800000001 |

## rider_media
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_rider_media_rider` | `rider_id` | — | 1773800000001 |

## rider_prospects
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_rider_prospects_entity` | `entity_id` | — | 1773800000001 |
| `idx_rider_prospects_rider_user` | `rider_user_id` | — | 1773800000001 |

## rider_user_roles
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_rider_user_roles_rider_id` | `rider_id` | — | 1775500000000 |

## riders
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_riders_primary_mobile` | `primary_mobile` | — | 1773800000001 |
| `idx_riders_status` | `status` | — | 1773800000001 |
| `idx_riders_delivery_company` | `delivery_company_id` | — | 1773800000001 |

## user_entities
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_user_entities_entity_type` | `entity_type` | U | 1737000000057 |

## wallet_accounts
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_wallet_accounts_customer_id` | `customer_id` | — | 1773500000001 |

## wallet_ledger
| Index Name | Columns | Type | Migration |
|---|---|---|---|
| `idx_wallet_ledger_award` | `award_id` | — | 1772779589209 |
| `idx_wallet_ledger_wallet_account` | `wallet_account_id` | — | 1772779589209 |

---

## Summary by Type

| Type | Count |
|---|---|
| Plain | 53 |
| Unique (U / UC) | 25 |
| Partial (P / CP) | 9 |
| Unique + Partial (UP) | 1 (`admin_users_email_active_idx`) |
| **Total** | **97** |

## Indexes Added in This Session

| Index Name | Table | Reason |
|---|---|---|
| `admin_users_email_active_idx` | `admin_users` | Login hot-path — partial on active users only, faster than the full unique index for `WHERE email = $1 AND deleted_at IS NULL` |
