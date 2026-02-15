# Changelog - Dia E

## 2026-02-15 - RLS Policy Fixes

### Fixed
- **Multiplayer room synchronization**: Players now appear correctly in room lobbies
  - Fixed `users` table RLS to allow reading all profiles
  - Fixed `sala_jogadores` table RLS to prevent infinite recursion

- **Game card compatibility**: "No compatible cards" error resolved
  - Fixed `preferencias` table RLS to allow reading all player preferences
  - Game can now check card compatibility for all players in the room

### Database Migrations Applied
1. `fix_sala_jogadores_rls_policy` - Fixed recursive policy on sala_jogadores
2. `fix_rls_circular_dependency` - Simplified policies to prevent circular dependencies
3. `allow_reading_public_user_data` - Allow reading public user profiles
4. `allow_reading_other_players_preferences` - Allow reading preferences for game compatibility

### Security
- All write operations remain restricted to own data
- Only public profile data (name, photo) is readable by others
- Authentication still required for all operations
