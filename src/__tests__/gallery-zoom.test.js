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

describe('The picture under a mouse (the lens and the zoom pane, like Alibaba)', () => {
  // `fine`: a pointer that hovers and is precise; `wide`: a screen with room for two columns
  const device = ({fine, wide = true}) => {
    window.matchMedia = (query) => ({
      matches: query.includes('hover: hover') ? fine : query.includes('min-width: 768px') ? wide : false,
      addEventListener() {}, removeEventListener() {},
    });
  };
  const pictureOf = () => screen.getByRole('button', {name: 'Open Blue Kettle (1 of 3) full screen'});
  const overPicture = (clientX, clientY) => {
    pictureOf().getBoundingClientRect = () => ({left: 0, top: 0, width: 200, height: 200});
    fireEvent.mouseMove(pictureOf(), {clientX, clientY});
  };

  it('shows a lens on the picture and the area under it, enlarged, in a pane beside it; the picture itself does not move', () => {
    device({fine: true});
    render(<Page />);
    overPicture(100, 100); // the middle

    const lens = screen.getByTestId('zoom-lens');
    expect(lens.style.left).toBe('30%'); // 40 % wide (1 / 2.5), centred on the pointer
    expect(lens.style.top).toBe('30%');
    expect(lens.style.width).toBe('40%');
    const pane = screen.getByTestId('zoom-pane');
    const image = pane.querySelector('img');
    expect(image.getAttribute('src')).toBe('/a.jpg'); // the full-size picture, not the thumbnail
    expect(image.parentElement.style.width).toBe('250%'); // 2.5 times the pane
    expect(image.parentElement.style.transform).toBe('translate(-30%, -30%)'); // moved so the lens's area fills the pane
    expect(screen.getByAltText('Blue Kettle (1 of 3)').style.transform).toBe(''); // the picture stays as it is
  });

  it('follows the pointer and never leaves the picture: at a corner the lens stops at the edge', () => {
    device({fine: true});
    render(<Page />);
    overPicture(0, 200); // the bottom left corner

    expect(screen.getByTestId('zoom-lens').style.left).toBe('0%');
    expect(screen.getByTestId('zoom-lens').style.top).toBe('60%'); // 100 - 40
    expect(screen.getByTestId('zoom-pane').querySelector('img').parentElement.style.transform).toBe('translate(-0%, -60%)');

    overPicture(200, 0); // the top right corner
    expect(screen.getByTestId('zoom-lens').style.left).toBe('60%');
    expect(screen.getByTestId('zoom-lens').style.top).toBe('0%');
  });

  it('goes away when the pointer leaves the picture', () => {
    device({fine: true});
    render(<Page />);
    overPicture(100, 100);
    expect(screen.getByTestId('zoom-pane')).toBeTruthy();

    fireEvent.mouseLeave(pictureOf());

    expect(screen.queryByTestId('zoom-lens')).toBeNull();
    expect(screen.queryByTestId('zoom-pane')).toBeNull();
  });

  it('is not a thing on a phone: nothing follows a finger, a tap opens the viewer and a small icon says so', () => {
    device({fine: false});
    render(<Page />);
    overPicture(100, 100); // the mouse events a browser sends after a tap
    expect(screen.queryByTestId('zoom-lens')).toBeNull();
    expect(screen.queryByTestId('zoom-pane')).toBeNull();
    expect(pictureOf().querySelector('svg')).not.toBeNull();
  });

  it('is not drawn on a narrow screen either, even with a mouse: the pane needs the details column beside the picture', () => {
    device({fine: true, wide: false});
    render(<Page />);
    overPicture(100, 100);
    expect(screen.queryByTestId('zoom-pane')).toBeNull();
    expect(pictureOf().querySelector('svg')).not.toBeNull(); // it opens the viewer, the expand icon says so
  });

  it('opens the viewer on a click, and the pane gets out of its way', () => {
    device({fine: true});
    render(<Page />);
    overPicture(100, 100);

    fireEvent.click(pictureOf());

    expect(viewer()).toBeTruthy();
    expect(screen.queryByTestId('zoom-pane')).toBeNull();
  });
});
