import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, imageUrl } from '../api.js';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink', 'Appetizer', 'Other'];

export default function RecipeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dinner');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.getRecipe(id).then(({ recipe }) => {
      setTitle(recipe.title);
      setDescription(recipe.description || '');
      setCategory(recipe.category);
      setCookTime(recipe.cook_time_minutes || '');
      setServings(recipe.servings || '');
      setIngredients(recipe.ingredients.join('\n'));
      setInstructions(recipe.instructions.join('\n'));
      setExistingImage(recipe.image_url);
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('cook_time_minutes', cookTime || 0);
      formData.append('servings', servings || 1);
      formData.append('ingredients', ingredients);
      formData.append('instructions', instructions);
      if (imageFile) formData.append('image', imageFile);

      if (isEdit) {
        const { recipe } = await api.updateRecipe(id, formData);
        navigate(`/recipes/${recipe.id}`);
      } else {
        const { recipe } = await api.createRecipe(formData);
        navigate(`/recipes/${recipe.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  }

  return (
    <div className="container" style={{ maxWidth: 640, padding: '2.5rem 1.25rem 4rem' }}>
      <h1>{isEdit ? 'Edit recipe' : 'Share a recipe'}</h1>
      <p style={{ color: 'var(--muted)', marginTop: '-0.5rem' }}>
        {isEdit ? 'Update the details below.' : 'Fill in the details so others can cook along.'}
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grandma's Sunday Sauce" />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short intro — what makes this recipe special?" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cookTime">Cook time (min)</label>
            <input id="cookTime" type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="servings">Servings</label>
            <input id="servings" type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="ingredients">Ingredients</label>
          <textarea
            id="ingredients"
            rows={6}
            required
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={'1 lb pasta\n2 cloves garlic, minced\n1 cup grated parmesan'}
          />
          <span className="hint">One ingredient per line.</span>
        </div>

        <div className="field">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            rows={6}
            required
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={'Bring a large pot of salted water to a boil.\nCook pasta until al dente.\nToss with sauce and serve.'}
          />
          <span className="hint">One step per line — steps will be numbered automatically.</span>
        </div>

        <div className="field">
          <label htmlFor="image">Photo</label>
          {existingImage && !imageFile && (
            <img src={imageUrl(existingImage)} alt="Current" style={{ width: 160, borderRadius: 8, marginBottom: '0.5rem' }} />
          )}
          <input id="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setImageFile(e.target.files[0])} />
          <span className="hint">JPEG, PNG, WEBP, or GIF — up to 5MB.</span>
        </div>

        <button className="btn" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Publish recipe'}
        </button>
      </form>
    </div>
  );
}
