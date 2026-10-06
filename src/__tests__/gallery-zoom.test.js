// The product's pictures, the way a modern shop shows them: a tap opens them full screen (swipe, pinch and double-tap to zoom, the video too),
// the page ends on the picture the customer last looked at, and under a mouse the picture grows around the pointer.
import React, {useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, within} from '@testing-library/react';

import ProductGallery from '../components/common/product/ProductGallery';

// Swiper draws nothing useful in jsdom (it measures the screen): plain boxes keep its slides in the page
vi.mock('swiper/react', () => ({
  Swiper: ({children}) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({children}) => <div>{children}</div>,
}));

const MEDIA = [
  {file_url: '/a.jpg', thumbnail_url: '/ta.jpg', file_type: 'image'},
  {file_url: '/b.jpg', thumbnail_url: '/tb.jpg', file_type: 'image'},
  {file_url: '/c.mp4', thumbnail_url: '/tc.jpg', file_type: 'video'},
];

const Page = ({media = MEDIA}) => {
  const [selected, setSelected] = useState(media[0]);
  return (
    <div>
      <ProductGallery media={media} selected={selected} onSelect={setSelected} name="Blue Kettle" />
      <p data-testid="selected">{selected?.file_url}</p>
    </div>
  );
};

const openFirst = () => fireEvent.click(screen.getByRole('button', {name: 'Open Blue Kettle (1 of 3) full screen'}));
const viewer = () => screen.getByRole('dialog', {name: 'Blue Kettle: pictures'});
const realMatchMedia = window.matchMedia;

beforeEach(() => {
  cleanup();
});
afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe('The full-screen viewer', () => {
  it('is not there until a picture is tapped, then opens on that picture', () => {
    render(<Page />);
    expect(screen.queryByRole('dialog')).toBeNull();

    openFirst();

    expect(within(viewer()).getByText('1 / 3')).toBeTruthy();
  });

  it('shows every picture, and the video, big', () => {
    render(<Page />);
    openFirst();

    const box = within(viewer());
    expect(box.getByAltText('Blue Kettle (1 of 3)')).toBeTruthy();
    expect(box.getByAltText('Blue Kettle (2 of 3)')).toBeTruthy();
    const video = viewer().querySelector('video');
    expect(video.getAttribute('src')).toBe('/c.mp4');
    expect(video.hasAttribute('controls')).toBe(true);
  });

  it('is drawn in the page body, so the box the shop scrolls in cannot scroll under it', () => {
    const {container} = render(<Page />);
    openFirst();
    expect(container.contains(viewer())).toBe(false);
    expect(document.body.contains(viewer())).toBe(true);
  });

  it('moves with its thumbnails and says where it is; the zoom hint is for pictures, not the video', () => {
    render(<Page />);
    openFirst();
    const box = within(viewer());
    expect(box.getByText('Pinch or double-tap to zoom')).toBeTruthy();

    fireEvent.click(box.getByRole('button', {name: 'Show picture 2'}));
    expect(box.getByText('2 / 3')).toBeTruthy();

    fireEvent.click(box.getByRole('button', {name: 'Show video 3'}));
    expect(box.getByText('3 / 3')).toBeTruthy();
    expect(box.queryByText('Pinch or double-tap to zoom')).toBeNull();
    expect(box.getByRole('button', {name: 'Next picture'}).disabled).toBe(true);
    expect(box.getByRole('button', {name: 'Previous picture'}).disabled).toBe(false);
  });

  it('has Previous and Next buttons for a computer', () => {
    render(<Page />);
    openFirst();
    const box = within(viewer());
    expect(box.getByRole('button', {name: 'Previous picture'}).disabled).toBe(true);
    fireEvent.click(box.getByRole('button', {name: 'Next picture'}));
    expect(box.getByText('2 / 3')).toBeTruthy();
  });

  it('closes with its button, and the page shows the picture the customer ended on', () => {
    render(<Page />);
    openFirst();
    fireEvent.click(within(viewer()).getByRole('button', {name: 'Show picture 2'}));

    fireEvent.click(within(viewer()).getByRole('button', {name: 'Close pictures'}));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('selected').textContent).toBe('/b.jpg');
  });

  it('closes with Esc and gives the focus back to the picture that was tapped', () => {
    render(<Page />);
    const picture = screen.getByRole('button', {name: 'Open Blue Kettle (1 of 3) full screen'});
    picture.focus();
    fireEvent.click(picture);
    expect(document.activeElement).toBe(viewer());

    fireEvent.keyDown(document, {key: 'Escape'});

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(picture);
    expect(screen.getByTestId('selected').textContent).toBe('/a.jpg'); // nothing was moved
  });

  it('works for a product with one picture: no counter arrows, no thumbnails', () => {
    render(<Page media={[MEDIA[0]]} />);
    fireEvent.click(screen.getByRole('button', {name: 'Open Blue Kettle (1 of 1) full screen'}));
    const box = within(viewer());
    expect(box.getByText('1 / 1')).toBeTruthy();
    expect(box.queryByRole('button', {name: 'Next picture'})).toBeNull();
    expect(box.queryByRole('button', {name: /Show picture/})).toBeNull();
  });
});

describe('The picture under a mouse', () => {
  const mouse = (matches) => {
    window.matchMedia = (query) => ({matches: matches && query.includes('hover: hover'), addEventListener() {}, removeEventListener() {}});
  };
  const pictureOf = () => screen.getByRole('button', {name: 'Open Blue Kettle (1 of 3) full screen'});

  it('grows around the pointer while it moves over it, and goes back when it leaves', () => {
    mouse(true);
    render(<Page />);
    fireEvent.mouseMove(pictureOf(), {clientX: 10, clientY: 10});
    const image = screen.getByAltText('Blue Kettle (1 of 3)');
    expect(image.style.transform).toBe('scale(2.5)');

    fireEvent.mouseLeave(pictureOf());
    expect(image.style.transform).toBe('');
  });

  it('is not a thing on a phone: a finger does not magnify, a tap opens the viewer and a small icon says so', () => {
    mouse(false);
    render(<Page />);
    fireEvent.mouseMove(pictureOf(), {clientX: 10, clientY: 10}); // the mouse events a browser sends after a tap
    expect(screen.getByAltText('Blue Kettle (1 of 3)').style.transform).toBe('');
    expect(pictureOf().querySelector('svg')).not.toBeNull();
  });

  it('still opens the viewer on a click', () => {
    mouse(true);
    render(<Page />);
    fireEvent.click(pictureOf());
    expect(viewer()).toBeTruthy();
  });
});
