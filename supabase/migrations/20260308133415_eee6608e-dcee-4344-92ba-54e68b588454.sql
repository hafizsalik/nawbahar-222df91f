
-- Add denormalized count columns
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS comment_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reaction_count integer NOT NULL DEFAULT 0;

-- Backfill existing counts
UPDATE public.articles a SET comment_count = (
  SELECT COUNT(*) FROM public.comments c WHERE c.article_id = a.id
);
UPDATE public.articles a SET reaction_count = (
  SELECT COUNT(*) FROM public.reactions r WHERE r.article_id = a.id
);

-- Trigger function for comment count
CREATE OR REPLACE FUNCTION public.update_article_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for reaction count
CREATE OR REPLACE FUNCTION public.update_article_reaction_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles SET reaction_count = reaction_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER trg_update_comment_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_article_comment_count();

CREATE TRIGGER trg_update_reaction_count
AFTER INSERT OR DELETE ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.update_article_reaction_count();
