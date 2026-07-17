
import { useState } from 'react'

import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { ButtonGroup } from './ui/button-group'
import { IconPlus, IconX } from '@tabler/icons-react'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group'
import { useLoadingContext } from '@/context/loading-context'
import api from '@/lib/api'


interface PropertiesSideBarProps {
  setPreview: React.Dispatch<React.SetStateAction<string>>
  formRefs: {
      formRef: React.RefObject<HTMLFormElement | null>;
      fileInputRef: React.RefObject<HTMLInputElement | null>;
  }
}

interface PreviewPDFFormData {
  title?: string
  paperSize: string
  fontFamily: string
  fontSize: number
  letterSpacing: number
  columns: number
  files: FileList
  useFileName: boolean
  marginLeft: number
  marginRight: number
  marginBottom: number
  ignored: {
    value: string
  }[]
  tagsToInclude: {
    value: string
  }[]
}

export function PropertiesSideBar({ setPreview, formRefs: { fileInputRef, formRef } }: PropertiesSideBarProps) {
  const { isLoading, updateLoading } = useLoadingContext();
  const [useFileNameChecked, setUseFileNameChecked] = useState(false)
  const [section, setSection] = useState('')
  const [tag, setTag] = useState('')

  const { register, handleSubmit, control, formState: {} } = useForm<PreviewPDFFormData>({
    defaultValues: {
      title: "Preview",
      columns: 2,
      fontSize: 10,
      letterSpacing: 0,
      paperSize: 'A4',
      fontFamily: 'Lora',
      marginBottom: 10
    }
  })

  const { ref: registerRef, ...fileRegisterRest } = register('files')

  const { fields: ignoredFields, append: appendIgnored, remove: removeIgnored } = useFieldArray({
    control,
    name: 'ignored'
  })

  const { fields: tagsFields, append: appendTags, remove: removeTags } = useFieldArray({
    control,
    name: 'tagsToInclude'
  })

  const generatePreview = async (data: PreviewPDFFormData) => {
    if (data.files.length === 0) return
    const formData = new FormData()
    Array.from(data.files).forEach(file => {
      formData.append("files", file)
    })

    formData.append(
      "config",
      JSON.stringify({
        title: data.title ?? "Preview",
        columns: data.columns,
        font_family: data.fontFamily,
        font_size: data.fontSize,
        letter_spacing: data.letterSpacing,
        paper_size: data.paperSize,
        use_file_name: useFileNameChecked,
        margin_right: data.marginRight,
        margin_left: data.marginLeft,
        margin_bottom: data.marginBottom,
        ignored: data.ignored.flatMap(i => i.value.toLowerCase()),
        tags: data.tagsToInclude.flatMap(i => i.value.toLowerCase()),
      })
    )

    updateLoading(true)

    try {
      const res = await api.post(
        "/preview",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          responseType: "blob"
        },
      )
      const blob = new Blob([res.data], { type: "application/pdf" })
      const resUrl = URL.createObjectURL(blob)

      setPreview(resUrl)
    } catch (err) {
      console.error(err)
    }

    updateLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit(generatePreview)}
      className='flex flex-col gap-2'
      ref={(e) => {
        if (formRef) (formRef as React.RefObject<HTMLFormElement | null>).current = e
      }}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} />

          <div className='flex gap-1'>
          <Checkbox
            id='use-file-name'
            checked={useFileNameChecked}
            onCheckedChange={(value) => setUseFileNameChecked(value as any)}
          />
          <Label htmlFor="use-file-name">Use file name?</Label>
          </div>
        </div>
        <div className='flex gap-2 w-full'>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor="fontSize">Font size</Label>
            <InputGroup>
              <InputGroupInput id='fontSize' placeholder="0.0" {...register('fontSize', {
                  valueAsNumber: true
                })}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>pt</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor="letterSpacing">Letter spacing</Label>
            <InputGroup>
              <InputGroupInput id='letterSpacing' placeholder="0.0" {...register('letterSpacing', {
                  valueAsNumber: true
                })}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>pt</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <Label htmlFor="columns">Columns</Label>
          <Input id="columns" {...register('columns')} />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Margins</Label>
          <div className='flex gap-1'>
            <div className='flex flex-1 flex-col gap-2'>
              <Label htmlFor="marginLeft">Left</Label>
              <InputGroup>
                <InputGroupInput id='marginLeft' placeholder="0" {...register('marginLeft', {
                    valueAsNumber: true
                  })}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>mm</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className='flex flex-1 flex-col gap-2'>
              <Label htmlFor="marginRight">Right</Label>
              <InputGroup>
                <InputGroupInput id='marginRight' placeholder="0" {...register('marginRight', {
                    valueAsNumber: true
                  })}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>mm</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className='flex flex-1 flex-col gap-2'>
              <Label htmlFor="marginBottom">Down</Label>
              <InputGroup>
                <InputGroupInput id='marginBottom' placeholder="0" {...register('marginBottom', {
                    valueAsNumber: true
                  })}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>mm</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <Label htmlFor="tagsToInclude">Tags to include</Label>
          <ButtonGroup className='w-full'>
            <Input value={tag} id="tagsToInclude" onChange={(e) => setTag(e.target.value)} />
            <Button
              variant='outline'
              aria-label="Plus"
              type='button'
              onClick={() => {
                appendTags({
                  value: tag
                })
                setTag('')
              }}
            >
              <IconPlus />
            </Button>
          </ButtonGroup>
          <ul className='flex gap-1'>
            {tagsFields.map((i, idx) =>
              <li>
                <Badge variant='default'>
                  <Button
                    size='xs'
                    className='p-0 cursor-pointer'
                    type='button'
                    onClick={
                      () => removeTags(idx)
                    }
                  >
                    {i.value}
                    <IconX />
                  </Button>
                </Badge>
              </li>
            )}
          </ul>
        </div>
        <div className='flex flex-col gap-2'>
          <Label htmlFor="ignoredSections">Ignored Sections</Label>
          <ButtonGroup className='w-full'>
            <Input value={section} id="ignoredSections" onChange={(e) => setSection(e.target.value)} />
            <Button
              variant='outline'
              aria-label="Plus"
              type='button'
              onClick={() => {
                appendIgnored({
                  value: section
                })
                setSection('')
              }}
            >
              <IconPlus />
            </Button>
          </ButtonGroup>
          <ul className='flex gap-1'>
            {ignoredFields.map((i, idx) =>
              <li>
                <Badge variant='default'>
                  <Button
                    size='xs'
                    type='button'
                    className='p-0 cursor-pointer'
                    onClick={
                      () => removeIgnored(idx)
                    }
                  >
                    {i.value}
                    <IconX />
                  </Button>
                </Badge>
              </li>
            )}
          </ul>
        </div>
        <div className='flex gap-2'>
          <div className='flex flex-1 flex-col gap-2'>
            <Label htmlFor="paperSize">Paper Type</Label>
            <Controller
              name="paperSize"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(value) => {
                  field.onChange(value)
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue defaultValue='A4' placeholder="Type of paper" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A5">A5</SelectItem>
                      <SelectItem value="A6">A6</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className='flex flex-1 flex-col gap-2'>
            <Label htmlFor="fontFamily">Font</Label>
            <Controller
              name="fontFamily"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue defaultValue='Lora' placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="EB Garamond">EB Garamond</SelectItem>
                      <SelectItem value="Crimson Text">Crimson Text</SelectItem>
                      <SelectItem value="CMU Serif">Computer Modern</SelectItem>
                      <SelectItem value="Lora">Lora</SelectItem>
                      <SelectItem value="Libre Baskerville">Libre Baskerville</SelectItem>
                      <SelectItem value="Tinos">Tinos</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <Separator className='my-4' />

      <div className="flex flex-col gap-2 border-b">
        <Label htmlFor="files-to-convert">Files to convert</Label>
        <Input
          id="files-to-convert"
          type="file"
          multiple
          accept=".md"
          {...fileRegisterRest}
          ref={(e) => {
            registerRef(e)
            if (fileInputRef) (fileInputRef as React.RefObject<HTMLInputElement | null>).current = e
          }}
        />
      </div>

      <Separator className='my-4' />

      <Button type='submit'>
        {isLoading ? "Loading..." : "Generate PDF"}
      </Button>
    </form>
  )
}
