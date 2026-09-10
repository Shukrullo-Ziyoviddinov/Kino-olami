import React from 'react';
import FilterReyting from './FilterReyting';
import FilterCountry from './FilterCountry';
import FilterGenre from './FilterGenre';
import FilterAge from './FilterAge';
import ScrollTouch from '../ScrollTouch/ScrollTouch';
import LoaderSkeleton from '../LoaderSkeleton/LoaderSkeleton';
import './FilterReyting.css';
import './FilterCountry.css';
import './FilterGenre.css';
import './FilterAge.css';

const getRatingFilter = (movie, selectedRating) => {
  if (selectedRating === null) return true;
  const val = movie.ratingImdb;
  return val != null && val !== '' && val !== 'none' && (val === selectedRating || Number(val) === Number(selectedRating));
};

const normalizeFilterValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[’ʻʼ`]/g, "'");

const hasSelectedGenre = (movie, normalizedSelectedGenres) =>
  normalizedSelectedGenres.length === 0 ||
  (movie.filterGenre || []).some((g) =>
    normalizedSelectedGenres.includes(normalizeFilterValue(g))
  );

const Filters = ({
  isLoading = false,
  movies = [],
  selectedRating,
  onRatingSelect,
  selectedCountry,
  onCountrySelect,
  selectedGenres = [],
  onGenreSelect,
  selectedAge = null,
  onAgeSelect,
}) => {
  const normalizedSelectedCountry = selectedCountry ? normalizeFilterValue(selectedCountry) : null;
  const normalizedSelectedGenres = selectedGenres.map(normalizeFilterValue);
  const hasSelectedCountry = (movie) =>
    !normalizedSelectedCountry || normalizeFilterValue(movie.filterCountry) === normalizedSelectedCountry;
  const hasSelectedRating = (movie) =>
    selectedRating === null || getRatingFilter(movie, selectedRating);
  const hasSelectedAge = (movie) =>
    selectedAge === null || movie.ageRestriction === selectedAge;

  const moviesForRating = movies.filter(
    (movie) =>
      hasSelectedCountry(movie) &&
      hasSelectedGenre(movie, normalizedSelectedGenres) &&
      hasSelectedAge(movie)
  );

  const moviesForCountry = movies.filter(
    (movie) =>
      hasSelectedRating(movie) &&
      hasSelectedGenre(movie, normalizedSelectedGenres) &&
      hasSelectedAge(movie)
  );

  const moviesForGenre = (() => {
    return movies.filter(
      (movie) =>
        hasSelectedRating(movie) &&
        hasSelectedCountry(movie) &&
        hasSelectedAge(movie)
    );
  })();

  const moviesForAge = (() => {
    return movies.filter(
      (movie) =>
        hasSelectedRating(movie) &&
        hasSelectedCountry(movie) &&
        hasSelectedGenre(movie, normalizedSelectedGenres)
    );
  })();

  return (
    <div className="filters">
      <div className="filters-container">
        <ScrollTouch className="filters-scroll">
        {isLoading ? (
          <div className="filters-skeleton-row">
            <LoaderSkeleton variant="filters-btn" width={140} height={44} />
            <LoaderSkeleton variant="filters-btn" width={120} height={44} />
            <LoaderSkeleton variant="filters-btn" width={100} height={44} />
            <LoaderSkeleton variant="filters-btn" width={90} height={44} />
          </div>
        ) : (
        <div className="filters-row">
        <FilterReyting
          movies={moviesForRating}
          selectedRating={selectedRating}
          onRatingSelect={onRatingSelect}
        />
        <FilterCountry
          movies={moviesForCountry}
          selectedCountry={selectedCountry}
          onCountrySelect={onCountrySelect}
        />
        <FilterGenre
          movies={moviesForGenre}
          selectedGenres={selectedGenres}
          onGenreSelect={onGenreSelect}
        />
        <FilterAge
          movies={moviesForAge}
          selectedAge={selectedAge}
          onAgeSelect={onAgeSelect}
        />
        </div>
        )}
        </ScrollTouch>
      </div>
    </div>
  );
};

export default Filters;
