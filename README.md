# Groove AI

[PLAY: Use Groove AI for yourself](https://groove-ai.netlify.app/)

[WATCH: Watch a demo](https://www.loom.com/share/0c8e99b9e17e40efa65e114a4845ae8a)

Hey, I'm Dan Ryland ([@RealDanRyland](https://twitter.com/RealDanRyland)) and I'm a drummer.

As a musician, I'm super interested in the developments around AI generated music and text-to-music AI models.

I've never submitted anything to a hackathon, so as this is my first ever, open source hackathon entry, I decided to make an AI generated drum pattern app.

These drum patterns and named and generated (genre, pattern and BPM) by Open AI's GPT 3.5 Turbo.

I then store these generated patterns in Supabase. Every time you load the site, it will randomly select one groove from the database. You can modify this pattern by toggling each beat. You can also generate a new drum pattern.

Enjoy!

## Supabase features

I'm using the following [Supabase](https://supabase.com/) featues:

- Database
  - Postgress function
  - Fetch
  - Insert
- Edge function

### Add Postgres function

```sql
CREATE OR REPLACE FUNCTION get_random_groove()
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMPTZ,
  title TEXT,
  description TEXT,
  genre TEXT,
  beat_high JSONB,
  beat_mid JSONB,
  beat_low JSONB,
  bpm SMALLINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM grooves
  ORDER BY random()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

It's build using [Quasar framework](https://quasar.dev/). To run locally you'll need these variables:

## Environment variables

For Quasar:

```bash
SUPABASE_URL
SUPABASE_KEY
SUPABASE_FUNCTION
```

For Supabase edge function:

```bash
OPENAI_API_KEY
```

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

## Hosting

Hosted on [Netlify](https://www.netlify.com/).

Build command:

```bash
quasar build
```

Publish directory:

```bash
dist/spa
```

## Icons

#### Favicon

```bash
icongenie generate -i src/assets/img/logo-groove-ai.png --quality 12 --skip-trim
```
