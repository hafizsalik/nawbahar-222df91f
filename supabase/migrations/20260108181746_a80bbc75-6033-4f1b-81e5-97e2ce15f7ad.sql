-- Create citations table for article references
CREATE TABLE public.citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  cited_article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_article_id, cited_article_id),
  CHECK (source_article_id != cited_article_id)
);

-- Enable RLS
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;

-- Anyone can view citations
CREATE POLICY "Citations are viewable by everyone"
ON public.citations FOR SELECT
USING (true);

-- Authors can add citations to their own articles
CREATE POLICY "Authors can add citations to their articles"
ON public.citations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.articles 
    WHERE id = source_article_id AND author_id = auth.uid()
  )
);

-- Authors can remove citations from their own articles
CREATE POLICY "Authors can remove citations from their articles"
ON public.citations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.articles 
    WHERE id = source_article_id AND author_id = auth.uid()
  )
);