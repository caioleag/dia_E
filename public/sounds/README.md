# Sound Effects

This directory contains UI sound effects for the Dia E game.

## Files

- **click.wav** - Button clicks and general UI interactions
- **success.wav** - Successful actions (player drawn, room created)
- **alert.mp3** - Alerts and errors (no compatible cards)
- **transition.wav** - State transitions (showing card, starting game)

## Usage

Sounds are managed through the `useSound` hook:

```tsx
import { useSound } from "@/lib/hooks/useSound";

function MyComponent() {
  const { play } = useSound();

  const handleClick = () => {
    play("click", 0.3); // volume 0-1
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Auto-play on Buttons

All `Button` components automatically play a click sound. To disable:

```tsx
<Button soundOnClick={false}>Silent button</Button>
```

## Credits

Sound effects from freesound.org:
- UI sounds by feraly, rescopicsound, hotpin7
