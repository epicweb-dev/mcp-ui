import { invariant } from '@epic-web/invariant'
import { useState, useTransition, useRef } from 'react'
import {
	ErrorBoundary,
	useErrorBoundary,
	type FallbackProps,
} from 'react-error-boundary'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { useMcpUiInit } from '#app/utils/mcp.ts'
import { useDoubleCheck } from '#app/utils/misc.ts'
import { type Route } from './+types/entry-viewer.tsx'

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : String(error)
}

export async function loader({ context, params }: Route.LoaderArgs) {
	const entryId = z.coerce.number().parse(params.entryId)
	const entry = await context.db.getEntry(entryId)
	invariant(entry, `Entry with ID "${entryId}" not found`)

	const formattedEntry = {
		...entry,
		createdAtFormatted: new Date(entry.createdAt * 1000).toLocaleDateString(),
		updatedAtFormatted: new Date(entry.updatedAt * 1000).toLocaleDateString(),
	}

	return { entry: formattedEntry }
}

export default function EntryViewerContent({
	loaderData,
}: Route.ComponentProps) {
	const { entry } = loaderData
	const [isDeleted, setIsDeleted] = useState(false)
	const rootRef = useRef<HTMLDivElement>(null)

	useMcpUiInit(rootRef)

	if (isDeleted) {
		return (
			<div
				ref={rootRef}
				className="bg-background max-h-[800px] overflow-y-auto p-4"
			>
				<div className="mx-auto max-w-4xl">
					<div className="bg-card mb-6 rounded-xl border p-6 shadow-lg">
						<h1 className="text-foreground text-3xl font-bold">
							Entry Deleted
						</h1>
						<p className="text-muted-foreground mb-4">
							Entry deleted successfully
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div
			ref={rootRef}
			className="bg-background max-h-[800px] overflow-y-auto p-4"
		>
			<div className="mx-auto max-w-4xl">
				<div className="bg-card mb-6 rounded-xl border p-6 shadow-lg">
					<div className="mb-4 flex items-center justify-between">
						<h1 className="text-foreground text-3xl font-bold">
							{entry.title}
						</h1>
					</div>

					<div className="mb-4 flex flex-wrap gap-2">
						{entry.tags.length > 0 ? (
							entry.tags.map((tag) => (
								<span
									key={tag.id}
									className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-sm"
								>
									🏷️ {tag.name}
								</span>
							))
						) : (
							<span className="text-muted-foreground text-sm">No tags</span>
						)}
					</div>

					<div className="mb-4 flex flex-wrap gap-6">
						{entry.mood && (
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground text-sm">💭</span>
								<span className="text-foreground text-sm font-medium">
									{entry.mood}
								</span>
							</div>
						)}
						{entry.location && (
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground text-sm">📍</span>
								<span className="text-foreground text-sm font-medium">
									{entry.location}
								</span>
							</div>
						)}
						{entry.weather && (
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground text-sm">🌤️</span>
								<span className="text-foreground text-sm font-medium">
									{entry.weather}
								</span>
							</div>
						)}
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm">📅</span>
							<span className="text-muted-foreground text-sm font-medium">
								Created: {entry.createdAtFormatted}
							</span>
						</div>
						{entry.updatedAt !== entry.createdAt && (
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground text-sm">✏️</span>
								<span className="text-muted-foreground text-sm font-medium">
									Updated: {entry.updatedAtFormatted}
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="bg-card rounded-xl border p-6 shadow-lg">
					<h2 className="text-foreground mb-4 text-xl font-semibold">
						Content
					</h2>
					<div className="text-foreground whitespace-pre-wrap">
						{entry.content}
					</div>
				</div>

				<div className="mt-6">
					<DeleteEntryButton
						entry={entry}
						onDeleted={() => setIsDeleted(true)}
					/>
				</div>
			</div>
		</div>
	)
}

function DeleteEntryButton({
	entry,
	onDeleted,
}: {
	entry: { id: number; title: string }
	onDeleted: () => void
}) {
	return (
		<ErrorBoundary FallbackComponent={DeleteEntryError}>
			<DeleteEntryButtonImpl entry={entry} onDeleted={onDeleted} />
		</ErrorBoundary>
	)
}

function DeleteEntryError({ error, resetErrorBoundary }: FallbackProps) {
	return (
		<div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-3">
			<p className="text-sm font-medium">Failed to delete entry</p>
			<p className="text-destructive/80 text-xs">{getErrorMessage(error)}</p>
			<button
				onClick={resetErrorBoundary}
				className="text-destructive mt-2 cursor-pointer text-xs hover:underline"
			>
				Try again
			</button>
		</div>
	)
}

function DeleteEntryButtonImpl({
	entry,
	onDeleted,
}: {
	entry: { id: number; title: string }
	onDeleted: () => void
}) {
	const [isPending, startTransition] = useTransition()
	const { doubleCheck, getButtonProps } = useDoubleCheck()
	const { showBoundary } = useErrorBoundary()

	const handleDelete = () => {
		if (!doubleCheck) return

		startTransition(async () => {
			try {
				throw new Error('TODO: this is not yet implemented')
			} catch (err) {
				showBoundary(err)
			}
		})
	}

	return (
		<button
			{...getButtonProps({
				onClick: doubleCheck ? handleDelete : undefined,
				disabled: isPending,
				className: `px-4 py-2 rounded-lg border transition-colors font-medium ${
					doubleCheck
						? 'bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90'
						: 'text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40'
				} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`,
			})}
		>
			{isPending ? 'Deleting...' : doubleCheck ? 'Confirm?' : 'Delete Entry'}
		</button>
	)
}

export { GeneralErrorBoundary as ErrorBoundary }
