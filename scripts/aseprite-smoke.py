"""Exercise an actual stdio MCP connection, then verify the exported art."""
import argparse
import asyncio
import json
import os
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--server', type=Path, required=True)
    parser.add_argument('--aseprite', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True,
                        help='New output directory (refuses to overwrite artwork)')
    args = parser.parse_args()
    server, binary, output = (p.expanduser().resolve() for p in
                              (args.server, args.aseprite, args.output))
    if not binary.is_file() or not (server / 'pyproject.toml').is_file():
        parser.error('Aseprite binary and MCP server checkout must exist')
    output.mkdir(parents=True, exist_ok=False)
    sprite = str(output / 'bottle.aseprite')
    params = StdioServerParameters(
        command='uv',
        args=['--directory', str(server), 'run', '--frozen', '--no-dev',
              '-m', 'aseprite_mcp'],
        env={**os.environ, 'ASEPRITE_PATH': str(binary)},
    )
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print(f'Connected: {len(tools.tools)} MCP tools')
            async def call(name, **kwargs):
                result = await session.call_tool(name, kwargs)
                text = '\n'.join(getattr(c, 'text', '') for c in result.content)
                if result.isError or any(s in text.lower() for s in
                                         ('error:', 'failed', 'not found')):
                    raise RuntimeError(f'{name}: {text}')
                print(f'{name}: {text}')
                return text
            await call('create_canvas', width=32, height=48, filename=sprite)
            result = await call('run_lua_script', filename=sprite,
                                script=(ROOT / 'art/experiments/bottle.lua').read_text())
            if 'BOTTLE_OK' not in result:
                raise RuntimeError('Drawing script did not complete')
            metadata = json.loads(await call('get_sprite_info', filename=sprite))
            assert (metadata['width'], metadata['height']) == (32, 48)
            assert [layer['name'] for layer in metadata['layers']] == [
                'Glass', 'Worn paper label', 'Lamp reflection']
            for name, scale in [('bottle.png', 1), ('bottle-preview.png', 8)]:
                await call('export_frame', filename=sprite, frame_index=1,
                           output_filename=str(output / name), scale=scale)
            await call('get_color_stats', filename=sprite)
    with Image.open(output / 'bottle.png') as image:
        assert image.size == (32, 48), image.size
        rgba = image.convert('RGBA')
        assert rgba.getpixel((0, 0))[3] == 0, 'Background must be transparent'
        assert rgba.getbbox(), 'Sprite must contain visible pixels'
        assert len(rgba.getcolors(256)) <= 11, 'Unexpected palette drift'
    with Image.open(output / 'bottle-preview.png') as image:
        assert image.size == (256, 384), image.size
    print(f'PASS: editable Aseprite source and verified PNG exports in {output}')

if __name__ == '__main__':
    asyncio.run(main())
